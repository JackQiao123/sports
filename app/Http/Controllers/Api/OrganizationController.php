<?php

namespace App\Http\Controllers\API;

use App\Organization;
use App\Member;
use App\Player;
use App\User;

use JWTAuth;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

use DB;

class OrganizationController extends Controller
{
  /**
   * Display the specified resource.
   *
   * @param  int  $id
   * @return \Illuminate\Http\Response
   */
  public function show($id)
  {
    $org = Organization::find($id);

    $parent = Organization::find($org['parent_id']);

    $org['parent'] = $parent['name_o'];

    $org['table'] = array();

    if ($org['is_club']) {
      $org['type'] = 'club';

      $players = Member::where('organization_id', $id)
                  ->leftJoin('roles', 'roles.id', '=', 'members.role_id')
                  ->leftJoin('players', 'players.member_id', '=', 'members.id')
                  ->select('members.*', 'roles.name AS role_name', 'players.weight', 'players.dan')
                  ->get();

      $org['table'] = $players;
    } else {
      $org['type'] = 'org';

      $members = Member::where('organization_id', $id)
                  ->leftJoin('roles', 'roles.id', '=', 'members.role_id')
                  ->select('members.*', 'roles.name AS role_name')
                  ->get();
      $org['members'] = $members;

      $clubs = Organization::where('parent_id', $id)->get();
      $org['table'] = $clubs;

      $org['president'] = '---';

      $president = Member::where('role_id', 1)
                      ->where('organization_id', $id)
                      ->where('position', 'NF manager')
                      ->first();

      if ($president) {
        $org['president'] = $president->name . ' ' . $president->surname;
      }

      $org['clubs'] = sizeof($clubs);

      $mplayers = Member::leftJoin('organizations', 'organizations.id', '=', 'members.organization_id')
                      ->where('members.role_id', 3)
                      ->where('members.gender', 1)
                      ->where('organizations.parent_id', $id)
                      ->count();

      $fplayers = Member::leftJoin('organizations', 'organizations.id', '=', 'members.organization_id')
                      ->where('members.role_id', 3)
                      ->where('members.gender', 0)
                      ->where('organizations.parent_id', $id)
                      ->count();
      
      $org['players'] = $mplayers + $fplayers;
      $org['mplayers'] = $mplayers;
      $org['fplayers'] = $fplayers;
    }

    return response()->json($org);
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

    $validator = Validator::make($data, [
      'parent_id' => 'required|integer',
      'name_o' => 'required|string|max:255',
      'name_s' => 'required|string|max:255',
      'email' => 'required|string|email|max:255|unique:organizations',
      'mobile_phone' => 'required|string|max:255',
      'addressline1' => 'required|string|max:255',
      'state' => 'required|string|max:255',
      'city' => 'required|string|max:255',
      'zip_code' => 'required|string|max:255',
      'level' => 'required|integer',
      'is_club' => 'required|boolean'
    ]);
      
    if ($validator->fails()) {
      return response()->json(
        [
          'status' => 'fail',
          'data' => $validator->errors()
        ],
        422
      );
    } else {
      $data['logo'] = "";

      $base64_image = $request->input('logo');
              
      if ($base64_image != '' && preg_match('/^data:image\/(\w+);base64,/', $base64_image)) {
        $pos  = strpos($base64_image, ';');
        $type = explode(':', substr($base64_image, 0, $pos))[1];

        if (substr($type, 0, 5) == 'image') {
          $filename = preg_replace('/[^A-Za-z0-9\-]/', '', $data['name_s']) . '-' . date('Ymd');

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

      if (is_null($data['addressline2'])) {
        $data['addressline2'] = "";
      }
            
      $org = Organization::create(array(
        'parent_id' => $data['parent_id'],
        'name_o' => $data['name_o'],
        'name_s' => $data['name_s'],
        'logo' => $data['logo'],
        'email' => $data['email'],
        'mobile_phone' => $data['mobile_phone'],
        'addressline1' => $data['addressline1'],
        'addressline2' => $data['addressline2'],
        'country' => $data['country'],
        'state' => $data['state'],
        'city' => $data['city'],
        'zip_code' => $data['zip_code'],
        'level' => $data['level'],
        'is_club' => $data['is_club']
      ));

      $member = Member::create(array(
        'organization_id' => $org->id,
        'role_id' => 1,
        'name' => $data['name_o'],
        'surname' => 'Manager',
        'profile_image' => '',
        'gender' => 1,
        'birthday' => date('Y-m-d'),
        'position' => $data['level'] == 2 ? 'Reg manager' : 'Club manager',
        'active' => 1,
        'register_date' => date('Y-m-d')
      ));

      $password = '';

      $characters = '0123456789?abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      $charactersLength = strlen($characters);

      for ($j = 0; $j < 8; $j++) {
          $password .= $characters[rand(0, $charactersLength - 1)];
      }

      User::create(array(
        'member_id' => $member->id,
        'password' => Hash::make($password),
        'email' => $data['email'],
        'is_nf' => 0
      ));
  
      $msg = "You were registered into Judo Federation system as a manager.\r\n";
      $msg .= "Please confirm the below url with the default password '" . $password . "'.\r\n";
      $msg .= url('/login');
      
      $headers = "From: administrator@sports.org";

      // mail($data['email'], "Invitation from LiveMedia", $msg, $headers);

      return response()->json([
        'status' => 'success'
      ], 200);
    }
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
    $data = $request->all();

    $validator = Validator::make($data, [
      'name_o' => 'required|string|max:255',
      'name_s' => 'required|string|max:255',
      'email' => 'required|string|email|max:255'
    ]);
    
    if ($validator->fails()) {
      return response()->json(
        [
          'status' => 'fail',
          'data' => $validator->errors()
        ],
        422
      );
    } else {
      $exist = Organization::where('email', $data['email'])->where('id', '!=', $id)->withTrashed()->count();
      
      if ($exist > 0) {
        return response()->json(
          [
              'status' => 'fail',
              'data' => 'Email already exist.'
          ],
          422
        );
      }

      $current = Organization::where('id', $id)->first();

      $base64_image = $request->input('logo');
      
      if ($base64_image != '' && preg_match('/^data:image\/(\w+);base64,/', $base64_image)) {
        $pos  = strpos($base64_image, ';');
        $type = explode(':', substr($base64_image, 0, $pos))[1];

        if (substr($type, 0, 5) == 'image') {
          $filename = preg_replace('/[^A-Za-z0-9\-]/', '', $data['name_s']) . '-' . date('Ymd');

          $type = str_replace('image/', '.', $type);

          $size = (int) (strlen(rtrim($base64_image, '=')) * 3 / 4);

          if ($size < 1050000) {
            $image = substr($base64_image, strpos($base64_image, ',') + 1);
            $image = base64_decode($image);
            
            Storage::disk('local')->delete(str_replace('photos/', '', $current->logo));
            Storage::disk('local')->put($filename . $type, $image);

            $data['logo'] = "photos/" . $filename . $type;
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
      
      if (!isset($data['logo']) || is_null($data['logo'])) {
        $data['logo'] = "";
      }

      if (is_null($data['addressline2'])) {
        $data['addressline2'] = "";
      }

      if ($data['is_club'] == 0) {
        $data['parent_id'] = 1;
      }
          
      Organization::where('id', $id)->update($data);

      return response()->json([
        'status' => 'success'
      ], 200);
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
    $user = JWTAuth::parseToken()->authenticate();

    if (isset($user)) {
      $members = Member::where('organization_id', $id)->get();

      if (sizeof($members) == 0) {
        $org = Organization::find($id);

        $child_org = Organization::where('parent_id', $id)->get();

        if (sizeof($child_org) == 0) {
          Organization::where('id', $id)->delete();

          return response()->json([
            'status' => 'success',
            'message' => 'Deleted Successfully'
          ], 200);
        } else {
          return response()->json(
            [
              'status' => 'error',
              'message' => 'Delete action failed. This federation has clubs now.'
            ],
            406
          );
        }
      } else {
        return response()->json(
          [
            'status' => 'error',
            'message' => 'Delete action failed. This organization has members now.'
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

  /**
   * Display a listing of the resource.
   *
   * @return \Illuminate\Http\Response
   */
  public function orgList($id)
  {
    $org = Organization::find($id);

    $result = array();

    if ($org->is_club == 0) {
      array_push($result, $org);

      $children = Organization::where('parent_id', $id)
                ->where('is_club', 0)
                ->orderBy('name_o')
                ->get();

      foreach ($children as $child) {
        array_push($result, $child);
      }
    } else {
      $parent = Organization::find($org->parent_id);

      array_push($result, $parent);
    }

    return response()->json($result);
  }

  public function clubList($id)
  {
    $myOrg = Organization::find($id);

    $clubs = array();

    if ($myOrg->is_club == 1) {
      $clubs = Organization::where('id', $id)
                  ->select('id', 'parent_id', 'name_o')
                  ->get();
    } else {
      $ids = array();

      if ($myOrg->parent_id == 0) {
        $orgs = Organization::where('parent_id', $myOrg->id)->get();

        foreach ($orgs as $org) {
          if ($org->is_club == 1) {
            array_push($ids, $org->id);
          } else {
            $children = Organization::where('parent_id', $org->id)->get();

            foreach($children as $child) {
              array_push($ids, $child->id);
            }
          }
        }
      } else {
        $orgs = Organization::where('parent_id', $myOrg->id)->get();

        foreach ($orgs as $org) {
          array_push($ids, $org->id);
        }
      }

      $clubs = Organization::whereIn('id', $ids)
                  ->select('id', 'parent_id', 'name_o')
                  ->orderBy('name_o')
                  ->get();
    }

    return response()->json($clubs);
  }

  /**
   * Display the child of the resource.
   *
   * @param  int  $id
   * @return \Illuminate\Http\Response
   */
  public function child($id)
  {
    $orgs = array();

    $childs = Organization::where('parent_id', $id)->orderBy('name_o')->get();

    foreach ($childs as $child) {
      $hasChild = Organization::where('parent_id', $child->id)->count();

      $child->children = $hasChild;

      array_push($orgs, $child);
    }

    return $orgs;
  }

  public function country_clubs($id) {
    $nf = Organization::find($id);

    $clubs = Organization::where('country', $nf->country)->where('is_club', 1)->orderBy('name_o')->get();

    return response()->json([
      'status' => 'success',
      'clubs' => $clubs
    ], 200);
  }

  /**
   * Display the search result of the resource.
   *
   * 
   * @return \Illuminate\Http\Response
   */
  public function search(Request $request)
  {
    $user = JWTAuth::parseToken()->authenticate();
    
    $me = array();
    $myOrg = array();

    if ($user->member_id == 0) {
      $item = $request->input('item');

      $myOrg = Organization::find($item);

      $manager = User::leftJoin('members', 'members.id', '=', 'users.member_id')
                  ->where('users.is_nf', 1)
                  ->where('members.organization_id', $item)
                  ->select('users.member_id')
                  ->get();

      $me = Member::find($manager[0]->member_id);
    } else {
      $me = Member::find($user->member_id);
      $myOrg = Organization::find($me->organization_id);
    }

    $orgArr = array();

    array_push($orgArr, $me->organization_id);

    if (!$myOrg->is_club) {
      $myOrgs = Organization::where('parent_id', $me->organization_id)->get();

      foreach ($myOrgs as $org) {
        array_push($orgArr, $org->id);

        $clubs = Organization::where('parent_id', $org->id)->get();

        foreach ($clubs as $club) {
          array_push($orgArr, $club->id);
        }
      }
    }
      
    sort($orgArr);

    $stype = $request->input('stype');
    $org = $request->input('org');
    $club = $request->input('club');
    $mtype = $request->input('mtype');
    $rtype = $request->input('rtype');
    $gender = $request->input('gender');
    $dan = $request->input('dan');

    $result = array();

    switch ($stype) {
      case 'org':
        $result = Organization::where('country', $myOrg->country)
                        ->where('parent_id', '!=', 0)
                        ->where('is_club', 0);
        
        if ($org != '') {
          $result = $result->where('id', $org);
        }

        $result = $result->orderBy('name_o')->get();
        break;
      case 'club':
        $result = Organization::where('country', $myOrg->country)->where('is_club', 1);

        if ($org != '') {
          $result = $result->where('parent_id', $org);
        }

        if ($club != '') {
          $result = $result->where('id', $club);
        }
                        
        $result = $result->orderBy('name_o')->get();
        break;
      case 'member':
        $result = Member::leftJoin('organizations', 'organizations.id', '=', 'members.organization_id')
                        ->leftJoin('roles', 'roles.id', '=', 'members.role_id');
        
        if ($mtype == 'judoka')
          $result = $result->leftJoin('players', 'players.member_id', '=', 'members.id');

        $result = $result->where('members.id', '!=', $me->id)
                        ->where('roles.description', $mtype);

        if ($club == '') {
          if ($org == '') {
            $result = $result->whereIn('organizations.id', $orgArr);
          } else {
            $clubArr = array();

            array_push($clubArr, $org);

            $clubs = Organization::where('parent_id', $org)->get();

            foreach($clubs as $club) {
              array_push($clubArr, $club->id);
            }

            $result = $result->whereIn('organizations.id', $clubArr);
          }
        } else {
          $result = $result->where('organizations.id', $club);
        }
          
        if ($mtype == 'judoka') {
          if ($gender == 2 || $gender == 1) {
            $result = $result->where('members.gender', $gender);
          }

          $result = $result->where('players.dan', 'like', '%' . $dan);

          $result = $result->select('members.*', 'organizations.name_o', 'organizations.level', 'players.weight', 
                                  'players.dan', 'players.expired_date')
                          ->orderBy('players.dan')
                          ->orderBy('members.name')
                          ->get();
        } else {
          if ($mtype == 'referee' && $rtype != '' && $rtype != 'all') {
            $result = $result->where('members.position', $rtype);
          }
              
          $result = $result->select('members.*', 'organizations.name_o', 'organizations.level', 'roles.name AS role_name')
                          ->orderBy('members.name')
                          ->get();
        }
          
        break;
    }

    return response()->json($result);
  }

  /**
   * Display the members of the resource.
   *
   * @param  int  $id
   * @return \Illuminate\Http\Response
   */
  public function members($id)
  {
    $org = Organization::find($id);

    $clubs = array();

    if ($org->is_club) {
      array_push($clubs, $org->id);
    } else {
      array_push($clubs, $org->id);

      $orgs = Organization::where('parent_id', $id)->get();

      foreach ($orgs as $row) {
        array_push($clubs, $row->id);

        $result = Organization::where('parent_id', $row->id)->get();

        foreach ($result as $res) {
          array_push($clubs, $res->id);
        }
      }
    }

    sort($clubs);

    $members = Member::leftJoin('players', 'members.id', '=','players.member_id')
                    ->leftJoin('organizations AS org1', 'org1.id', '=', 'members.organization_id')
                    ->leftJoin('organizations AS org2', 'org2.id', '=', 'org1.parent_id')
                    ->leftJoin('roles', 'roles.id', '=', 'members.role_id')
                    ->whereIn('members.organization_id', $clubs)
                    ->where('members.role_id', '!=', 1)
                    ->where('members.active', '!=', 1)
                    ->select('members.*', 'org2.name_o AS region', 'org1.name_o AS club', 
                             'roles.name AS role_name', 'players.weight', 'players.dan')
                    ->orderBy('members.role_id')
                    ->orderBy('members.name')
                    ->get();

    return response()->json($members);
  }
}