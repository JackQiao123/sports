<?php
namespace App\Http\Controllers\Api;

use App\User;
use App\Member;
use App\Organization;

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
}