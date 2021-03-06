<?php

namespace App\Http\Controllers\API;

use App\Member;
use App\Organization;
use App\User;
use App\Player;
use App\Competition;
use App\CompetitionMembers;

use JWTAuth;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

use DB;

class MemberController extends Controller
{
  /**
   * Display a listing of the resource.
   *
   * @return \Illuminate\Http\Response
   */
  public function index(Request $request)
  {
    $input = $request->all();
    
    $user_id = $input['user_id'];
    $org_id = $input['org_id'];
    $level = $input['level'];

    $org_ids = array((int)$org_id);

    switch ($level) {
      case 1:
        $orgs = Organization::where('parent_id', $org_id)->get();

        foreach ($orgs as $org) {
          array_push($org_ids, $org->id);

          $clubs = Organization::where('parent_id', $org->id)->get();

          foreach ($clubs as $club) {
            array_push($org_ids, $club->id);
          }
        }
        break;
      case 2:
        $clubs = Organization::where('parent_id', $org_id)->get();

        foreach ($clubs as $club) {
          array_push($org_ids, $club->id);
        }
        break;
      default:
        break;
    }

    $members = Member::leftJoin('organizations', 'organizations.id', '=', 'members.organization_id')
                    ->leftJoin('roles', 'roles.id', '=', 'members.role_id')
                    ->whereIn('organization_id', $org_ids)
                    ->where('members.id', '!=', $user_id)
                    ->select('members.*', 'organizations.name_o', 'organizations.level', 'roles.name AS role_name')
                    ->orderBy('name')
                    ->orderBy('surname')
                    ->get();

    return response()->json($members);
  }

  /**
   * Display the specified resource.
   *
   * @param  int  $id
   * @return \Illuminate\Http\Response
   */
  public function show($id)
  {
    $member = Member::where('members.id', $id)
                    ->leftJoin('organizations AS club', 'club.id', '=', 'members.organization_id')
                    ->leftJoin('organizations AS org', 'org.id', '=', 'club.parent_id')
                    ->leftJoin('roles', 'roles.id', '=', 'members.role_id')
                    ->leftJoin('users', 'users.member_id', '=', 'members.id')
                    ->select('members.*', 
                              'org.name_o AS org_name', 'org.id AS org_id',
                              'club.name_o AS club_name', 'club.id AS club_id',
                              'club.level', 'roles.name AS role_name', 'roles.is_player',
                              'users.id AS uid', 'users.deleted_at AS status')
                    ->first();

    if (isset($member)) {
      $role = DB::table('roles')->find($member->role_id);
      
      if ($role->is_player) {
        $member = Member::where('members.id', $id)
                ->leftJoin('organizations AS club', 'club.id', '=', 'members.organization_id')
                ->leftJoin('organizations AS org', 'org.id', '=', 'club.parent_id')
                ->leftJoin('roles', 'roles.id', '=', 'members.role_id')
                ->leftJoin('players', 'players.member_id', '=', 'members.id')
                ->select('members.*',
                          'org.name_o AS org_name', 'org.id AS org_id',
                          'club.name_o AS club_name', 'club.id AS club_id',
                          'club.level', 'roles.name AS role_name', 'roles.is_player',
                          'players.weight', 'players.dan', 'players.expired_date',
                        DB::raw("null AS uid, null AS status"))
                ->first();
      }

      return response()->json($member);
    } else {
      return response()->json(
        [
          'status' => 'error',
          'message' => 'Invalid Member ID'
        ],
        406
      );
    }
  }

  /**
   * Store a newly created resource in storage.
   *
   * @param  \Illuminate\Http\Request  $request
   * @return \Illuminate\Http\Response
   */
  public function store(Request $request)
  {
    $data = $request->all();
    
    $validMember = Validator::make($data, [
      'organization_id' => 'required',
      'role_id' => 'required',
      'name' => 'required|string|max:255',
      'surname' => 'required|string|max:255',
      'gender' => 'required|integer',
      'birthday' => 'required|date',
      'active' => 'required|boolean',
      'register_date' => 'required|date'
    ]);

    if ($validMember->fails()) {
      return response()->json(
        [
          'status' => 'fail',
          'data' => $validMember->errors()
        ],
        422
      );
    }
      
    $validPlayer = Validator::make($data, [
      'weight' => 'required',
      'dan' => 'required'
    ]);
      
    $role = DB::table('roles')->where('id', $data['role_id'])->first();

    if ($role->is_player) {
      if ($validPlayer->fails()) {
        return response()->json(
          [
            'status' => 'fail',
            'data' => $validPlayer->errors(),
          ],
          422
        );
      }

      $org = Organization::find($data['organization_id']);

      if ($org->parent_id == 0) {
        return response()->json(
          [
            'status' => 'error',
            'message' => 'Judoka can\'t be registered in National Federation.'
          ],
          406
        );
      }
    }

    $data['profile_image'] = "";
    
    $base64_image = $request->input('profile_image');
                  
    if ($base64_image != '' && preg_match('/^data:image\/(\w+);base64,/', $base64_image)) {
      $pos  = strpos($base64_image, ';');
      $type = explode(':', substr($base64_image, 0, $pos))[1];

      if (substr($type, 0, 5) == 'image') {
        $filename = preg_replace('/[^A-Za-z0-9\-]/', '', $data['name'] . '-' . $data['surname']) . '-' . date('Ymd');

        $type = str_replace('image/', '.', $type);

        $size = (int) (strlen(rtrim($base64_image, '=')) * 3 / 4);

        if ($size < 1050000) {
          $image = substr($base64_image, strpos($base64_image, ',') + 1);
          $image = base64_decode($image);
          
          Storage::disk('local')->put($filename . $type, $image);
  
          $data['profile_image'] = "photos/" . $filename . $type;
        } else {
          return response()->json(
            [
              'status' => 'error',
              'message' => 'File size must be less than 1MB.'
            ],
            406
          );
        }
      } else {
        return response()->json(
          [
            'status' => 'error',
            'message' => 'File type is not image.'
          ],
          406
        );
      }
    }

    if (is_null($data['position'])) {
      $data['position'] = "";
    }

    $member = Member::create(array(
      'organization_id' => $data['organization_id'],
      'role_id' => $data['role_id'],
      'name' => $data['name'],
      'surname' => $data['surname'],
      'profile_image' => $data['profile_image'],
      'gender' => $data['gender'],
      'birthday' => $data['birthday'],
      'position' => $data['position'],
      'active' => $data['active'],
      'register_date' => $data['register_date']
    ));
      
    $member_id = $member->id;

    if ($role->is_player && !$validPlayer->fails()) {
      Player::create(array(
        'member_id' => $member_id,
        'weight' => $data['weight'],
        'dan' => $data['dan']
      ));
    }

    return response()->json([
      'status' => 'success'
    ], 200);
  }

  /**
   * Update the specified resource in storage.
   *
   * @param  \Illuminate\Http\Request  $request
   * @param  int  $id
   * @return \Illuminate\Http\Response
   */
  public function update(Request $request, $id)
  {
    $member = Member::find($id);

      if (isset($member)) {
        $data = $request->all();

        $validMember = Validator::make($data, [
          'org_id' => 'required',
          'role_id' => 'required',
          'name' => 'required|string|max:255',
          'surname' => 'required|string|max:255',
          'gender' => 'required|integer',
          'birthday' => 'required|date',
          'register_date' => 'required|date'
        ]);

        if ($validMember->fails()) {
          return response()->json(
            [
              'status' => 'fail',
              'data' => $validMember->errors()
            ],
            422
          );
        }

        $role = DB::table('roles')->where('id', $data['role_id'])->first();

        if ($role->is_player) {
          $validPlayer = Validator::make($data, [
            'weight' => 'required',
            'dan' => 'required'
          ]);

          if ($validPlayer->fails()) {
            return response()->json(
              [
                'status' => 'fail',
                'data' => $validPlayer->errors()
              ],
              422
            );
          }
        }

        $current = Member::where('id', $id)->first();

        if ($current->role_id != $role->id) {
          if ($role->is_player) {
            $data['position'] = '';
            
            User::where('member_id', $id)->delete();

            $checkDeleted = Player::withTrashed()->where('member_id', $id)->count();

            if ($checkDeleted == 0) {                    
              Player::create(array(
                'member_id' => $id,
                'weight' => $data['weight'],
                'dan' => $data['dan']
              ));
            } else {
              Player::withTrashed()->where('member_id', $id)->restore();
            }
          } else {
            Player::where('member_id', $id)->delete();
          }
        }

        $base64_image = $request->input('profile_image');
          
        if ($base64_image != '' && preg_match('/^data:image\/(\w+);base64,/', $base64_image)) {
          $pos  = strpos($base64_image, ';');
          $type = explode(':', substr($base64_image, 0, $pos))[1];

          if (substr($type, 0, 5) == 'image') {
            $filename = preg_replace('/[^A-Za-z0-9\-]/', '', $data['name'] . '-' . $data['surname']) . '-' . date('Ymd');

            $type = str_replace('image/', '.', $type);

            $size = (int) (strlen(rtrim($base64_image, '=')) * 3 / 4);
            
            if ($size < 1050000) {
              $image = substr($base64_image, strpos($base64_image, ',') + 1);
              $image = base64_decode($image);
              
              Storage::disk('local')->delete(str_replace('photos/', '', $current->profile_image));
              Storage::disk('local')->put($filename . $type, $image);
  
              $data['profile_image'] = "photos/" . $filename . $type;
            } else {
              return response()->json(
                [
                  'status' => 'error',
                  'message' => 'File size must be less than 1MB.'
                ],
                406
              );
            }
          } else {
            return response()->json(
              [
                'status' => 'error',
                'message' => 'File type is not image.'
              ],
              406
            );
          }
        }

        if (!isset($data['profile_image']) || is_null($data['profile_image'])) {
          $data['profile_image'] = "";
        }

        if (!isset($data['position']) || is_null($data['position'])) {
          $data['position'] = "";
        }

        $orgID = '';

        if (($data['role_id'] == 2 || $data['role_id'] == 4) && $data['club_id'] != '') {
          $orgID = $data['club_id'];
        } else {
          $orgID = $data['org_id'];
        }

        Member::where('id', $id)->update(array(
          'organization_id' => $orgID,
          'role_id' => $data['role_id'],
          'name' => $data['name'],
          'surname' => $data['surname'],
          'profile_image' => $data['profile_image'],
          'gender' => $data['gender'],
          'birthday' => $data['birthday'],
          'position' => $data['position'],
          'register_date' => $data['register_date']
        ));

        $member_id = $member->id;

        if ($role->is_player) {
          Player::where('member_id', $member_id)->update(array(
            'weight' => $data['weight'],
            'dan' => $data['dan']
          ));
        }

        return response()->json([
          'status' => 'success',
          'data' => $data
        ], 200);
      } else {
        return response()->json(
          [
            'status' => 'error',
            'message' => 'Invalid Member ID'
          ],
          406
        );
      }
  }

  /**
   * Remove the specified resource from storage.
   *
   * @param  int  $id
   * @return \Illuminate\Http\Response
   */
  public function destroy($id)
  {
    $member = Member::find($id);

    $user = JWTAuth::parseToken()->authenticate();

    if (isset($user)) {
      $member = Member::find($id);

      if (isset($member)) {
        $role = DB::table('roles')->where('id', $member->role_id)->first();

        if ($role->is_player) {
          Player::where('member_id', $id)->delete();
        } else {
          User::where('member_id', $id)->delete();
        }

        Member::where('id', $id)->delete();

        return response()->json([
          'status' => 'success',
          'message' => 'Deleted Successfully'
        ], 200);
      } else {
        return response()->json(
          [
            'status' => 'error',
            'message' => 'Invalid Member ID'
          ],
          406
        );
      }
    } else {
      return response()->json(
        [
          'status' => 'error',
          'message' => 'Invalid credentials.'
        ],
        406
      );
    }
  }

  public function allow(Request $request)
  {
    $data = $request->all();

    $myOrg = Organization::find($data['club_id']);

    $orgids = array();

    array_push($orgids, $myOrg->id);

    if ($myOrg->parent_id == 0) {
      $orgs = Organization::where('parent_id', $myOrg->id)->get();

      foreach ($orgs as $org) {
        array_push($orgids, $org->id);
      
        $children = Organization::where('parent_id', $org->id)->get();

        foreach($children as $child) {
          array_push($orgids, $child->id);
        }
      }
    } else {
      $orgs = Organization::where('parent_id', $myOrg->id)->get();

      foreach ($orgs as $org) {
        array_push($orgids, $org->id);
      }
    }

    sort($orgids);

    $compMember = CompetitionMembers::where('competition_id', $data['competition_id'])
                        ->whereIn('club_id', $orgids)
                        ->get();

    $memids = array();

    for ($i = 0; $i < sizeof($compMember); $i++) {
      $ids = explode(',', $compMember[$i]->member_ids);
      $memids = array_merge($memids, $ids);
    }

    $members = Member::leftJoin('players', 'players.member_id', '=', 'members.id')
                    ->leftJoin('roles', 'roles.id', '=', 'members.role_id')
                    ->leftJoin('organizations', 'organizations.id', '=', 'members.organization_id')
                    ->whereNotIn('members.id', $memids)
                    ->whereIn('members.organization_id', $orgids)
                    ->where('members.active', 1)
                    ->where('members.role_id', '!=', 1)
                    ->select('members.*', 'organizations.name_o as org_name', 'roles.name as role_name',
                              'players.weight', 'players.dan')
                    ->orderBy('members.role_id')
                    ->orderBy('members.name')
                    ->get();

    return response()->json([
      'status' => 200,
      'data' => $members
    ]);
  }

  /**
   * Display a list of Member's Role.
   *
   * @param  int  $id
   * @return \Illuminate\Http\Response
   */
  public function roles()
  {
    $roles = DB::table('roles')->get();

    return response()->json($roles);
  }
}