<?php
namespace App\Http\Controllers\Api;

use App\User;
use App\Member;
use App\Organization;
use App\Invitation;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

use DB;

class UserController extends Controller
{
	public function login(Request $request)
	{
		$validator = Validator::make(
			$request->all(),
			[
				'email' => 'required|string|email|max:255',
				'password' => 'required|string|min:6',
			]
		);

		if ($validator->fails()) {
			return response()->json(
				[
					'status' => 'fail',
					'data' => $validator->errors(),
				],
				422
			);
		}

		$credentials = $request->only('email', 'password');
		try {
			if (!$token = JWTAuth::attempt($credentials)) {
				return response()->json(
					[
							'status' => 'error',
							'message'=> 'Invalid credentials.'
					],
					406
				);
			}
		} catch (JWTException $e) {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Invalid credentials.'
				],
				406
			);
		}

		$user = User::where('email', $request->email)->first();
		$member = Member::where('id', $user->member_id)->get();

		if (sizeof($member) > 0) {
			if ($member[0]->active) {
				$org = Organization::find($member[0]->organization_id);

				return response()->json([
					'status' => 'success',
					'data' => [
						'token' => $token,
						'user' => [
							'member_info' => $member[0],
							'org_name' => $org->name_o,
							'logo' => $org->logo,
							'level' => $org->level,
							'country' => $org->country,
							'is_nf' => $user->is_nf,
							'is_super' => 0,
							'is_club_member' => $org->is_club
						]
					]
				], 200);
			} else {
				return response()->json(
					[
						'status' => 'error',
						'message' => 'User is not activated.'
					],
					406
				);
			}
		} else {
				return response()->json([
						'status' => 'success',
						'data' => [
								'token' => $token,
								'user' => [
										'member_info' => $user,
										'is_super' => 1,
										'is_club_member' => 0
								]
						]
				], 200);
		}
	}

	public function store(Request $request)
	{
		$data = $request->all();

		$exist = Invitation::where('email', $data['email'])->first();

		if ($data['code'] == $exist->vcode) {
			$member = Member::where('email', $data['email'])->first();

			User::create(array(
				'member_id' => $member->id,
				'password' => Hash::make($data['pass']),
				'email' => $data['email'],
				'is_nf' => 0
			));

			Member::where('email', $data['email'])->update(['active' => 1]);

			Invitation::where('email', $data['email'])->delete();

			return response()->json([
				'status' => 'success'
			], 200);
		} else {
			$errArr['code'] = 'Invalid Verification Code.';

			return response()->json(
				[
					'status' => 'error',
					'data' => $errArr
				],
				422
			);
		}
	}

	public function profile()
	{
		$user = JWTAuth::parseToken()->authenticate();

		$member = Member::leftJoin('organizations', 'organizations.id', '=', 'members.organization_id')
								->leftJoin('roles', 'roles.id', '=', 'members.role_id')
								->where('members.id', $user->member_id)
								->select('members.*', 'organizations.parent_id', 'organizations.name_o', 'roles.name AS role')
								->get();

		return response()->json($member[0]);
	}

	public function setting()
	{
		$user = JWTAuth::parseToken()->authenticate();

		$setting = Member::leftJoin('settings', 'settings.organization_id', '=', 'members.organization_id')
								->where('members.id', $user->member_id)
								->select('settings.*')
								->get();

		return response()->json($setting[0]);
	}

	public function reset(Request $request, $token)
	{
		$data = $request->all();

		$user = JWTAuth::parseToken()->authenticate();

		if (!(Hash::check($data['current'], $user->password))) {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Your current password does not matches with the password you provided. Please try again.'
				],
				406
			);
		}

		if(strcmp($data['current'], $data['password']) == 0){
			return response()->json(
				[
					'status' => 'error',
					'message' => 'New Password cannot be same as your current password. Please choose a different password.'
				],
				406
			);
		}

		$validatedData = $request->validate([
			'current' => 'required',
			'password' => 'required|string|min:6|confirmed',
		]);

		$user->password = Hash::make($data['password']);
		$user->save();

		return response()->json(
			[
				'status' => 'success',
				'message' => 'Password changed successfully !'
			],
			200
		);
	}

	public function invite()
	{
		$user = JWTAuth::parseToken()->authenticate();
		$me = Member::find($user->member_id);

		$myOrg = Organization::find($me->organization_id);

		$allOrgs = array();

		if ($myOrg->is_club == 1) {
			array_push($allOrgs, $myOrg->id);
		} else {
			array_push($allOrgs, $myOrg->id);

			$orgs = Organization::where('parent_id', $myOrg->id)->get();

			foreach ($orgs as $org) {
				if ($org->is_club == 1) {
					array_push($allOrgs, $org->id);
				} else {
					array_push($allOrgs, $org->id);

					$clubs = Organization::where('parent_id', $org->id)->get();

					foreach ($clubs as $club) {
							array_push($allOrgs, $club->id);
					}
				}
			}
		}

		$members = Member::leftJoin('organizations', 'organizations.id', 'members.organization_id')
										->leftJoin('invitations', 'members.email', '=', 'invitations.email')
										->whereIn('members.organization_id', $allOrgs)
										->where('members.role_id', 1)
										->where('members.active', '!=', 1)
										->select('members.*', 'invitations.created_at AS invited',
														'organizations.name_o', 'organizations.parent_id', 'organizations.is_club')
										->orderBy('members.name')
										->get();
										
		for ($i = 0; $i < sizeof($members); $i++) {
			if (is_null($members[$i]->invited))
				$members[$i]->invited = 0;
			else
				$members[$i]->invited = 1;
		}

		$users = User::leftJoin('members', 'members.id', '=', 'users.member_id')
									->leftJoin('organizations', 'organizations.id', 'members.organization_id')
									->where('members.id', '!=', $me->id)
									->whereIn('members.organization_id', $allOrgs)
									->select('members.*', 'organizations.name_o', 'organizations.parent_id', 'organizations.is_club')
									->orderBy('members.name')
									->get();

		$result = array(
			'members' => $members,
			'users' => $users
		);

		return response()->json($result);
	}

	public function invite_send(Request $request)
	{
		$data = $request->all();

		$token = Hash::make($data['email']);
		
		$msg = "You have an invitation to register as a manager in our system.\r\n";
		$msg .= "Please confirm the below url.\r\n";
		$msg .= url('/invite-accept?token=' . $token);
		
		$headers = "From: administrator@sports.org";

		// mail($data['email'], "Invitation from LiveMedia", $msg, $headers);
		
		$exist = Invitation::where('email', $data['email'])->count();
		
		if ($exist == 0) {
			Invitation::create(array(
				'email' => $data['email'],
				'token' => $token,
				'created_at' => date('Y-m-d H:i:s')
			));
		} else {
			Invitation::where('email', $data['email'])->update(array(
				'email' => $data['email'],
				'token' => $token,
				'created_at' => date('Y-m-d H:i:s')
			));
		}        
		
		return response()->json([
			'status' => 'success',
			'message' => 'Invite sent successfully.'
		], 200);
	}

	public function invite_accept(Request $request)
	{
		$token = $request->input('token');
		
		if (is_null($token) || $token == '') {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Empty token.'
				],
				406
			);
		} else {
			$exist = Invitation::where('token', $token)->get();

			if (sizeof($exist) == 1) {
				$code = '';

				$characters = '0123456789';
				$charactersLength = strlen($characters);

				for ($j = 0; $j < 6; $j++) {
						$code .= $characters[rand(0, $charactersLength - 1)];
				}

				$msg = "Please use the below verification code to register now.\r\n";
				$msg .= "Verification Code: " . $code;
				
				$headers = "From: administrator@sports.org";

				// mail($exist[0]->email, "Invitation from LiveMedia", $msg, $headers);

				Invitation::where('token', $token)->update(array(
					'email' => $exist[0]->email,
					'token' => $token,
					'vcode' => $code,
					'codesent_at' => date('Y-m-d H:i:s')
				));

				return response()->json([
					'status' => 'success',
					'member' => $exist[0]
				], 200);
			} else {
				return response()->json(
					[
						'status' => 'error',
						'message' => 'Invalid token.'
					],
					406
				);
			}
		}
	}
}