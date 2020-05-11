<?php

namespace App\Http\Controllers\Api;

use App\Member;
use App\Organization;
use App\Competition;
use App\CompetitionMembers;
use App\Notification;

use JWTAuth;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

use DB;

class CompetitionController extends Controller
{
  public function index()
  {
    $user = JWTAuth::parseToken()->authenticate();

    $competitions = array();

    if (isset($user)) {
      $member = Member::find($user->member_id);
      $org = Organization::find($member->organization_id);
      $orgs = Organization::where('country', $org->country)->get();

      $ids = array();
      foreach($orgs as $org) {
        array_push($ids, $org->id);
      }

      $competitions = Competition::where('from', 'like', date('Y') . '-%')
                    ->whereIn('creator_id', $ids)
                    ->orderBy('from')
                    ->get();
    }

    return response()->json([
      'status' => 200,
      'competitions' => $competitions
    ]);
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
        'creator_id' => 'required|integer',
        'name' => 'required|string|max:255',
        'short_name' => 'required|string|max:255',
        'place' => 'required|string|max:255',
        'type' => 'required|string|max:255',
        'from' => 'required|string|max:255',
        'to' => 'required|string|max:255',
        'register_from' => 'required|string|max:255',
        'register_to' => 'required|string|max:255',
        'legal_birth_from' => 'required|string|max:255',
        'legal_birth_to' => 'required|string|max:255',
        'gender' => 'required|string|max:255',
        'weights' => 'required|string|max:255'
    ]);

    if ($validator->fails()) {
        return response()->json(
            [
                'status' => 'fail',
                'data' => $validator->errors(),
            ],
            422
        );
    } else {
      if ($data['from'] > $data['to']) {
        return response()->json(
          [
            'status' => 'fail',
            'message' => 'Competition period is not valid'
          ],
          406
        );
      }

      if ($data['register_from'] > $data['register_to']) {
        return response()->json(
          [
            'status' => 'fail',
            'message' => 'Registration period is not valid'
          ],
          406
        );
      }

      if ($data['register_to'] > $data['from']) {
        return response()->json(
          [
            'status' => 'fail',
            'message' => 'Registration period is not valid'
          ],
          406
        );
      }

      if ($data['legal_birth_from'] > $data['legal_birth_to']) {
        return response()->json(
          [
            'status' => 'fail',
            'message' => 'Registration period is not valid'
          ],
        406
        );
      }

      $competition = Competition::create(array(
        'creator_id' => $data['creator_id'],
        'name' => $data['name'],
        'short_name' => $data['short_name'],
        'place' => $data['place'],
        'type' => $data['type'],
        'from' => $data['from'],
        'to' => $data['to'],
        'register_from' => $data['register_from'],
        'register_to' => $data['register_to'],
        'legal_birth_from' => $data['legal_birth_from'],
        'legal_birth_to' => $data['legal_birth_to'],
        'gender' => $data['gender'],
        'weights' => $data['weights']
      ));

      return response()->json([
        'status' => 'success'
      ], 200);
    }
  }

  public function update($id, Request $request)
  {
    $data = $request->all();

    if ($data['from'] > $data['to']) {
      return response()->json(
        [
          'status' => 'fail',
          'message' => 'Competition period is not valid'
        ],
        406
      );
    }

    if ($data['register_from'] > $data['register_to']) {
      return response()->json(
        [
          'status' => 'fail',
          'message' => 'Registration period is not valid'
        ],
        406
      );
    }

    if ($data['register_to'] > $data['from']) {
      return response()->json(
        [
          'status' => 'fail',
          'message' => 'Registration period is not valid'
        ],
        406
      );
    }

    if ($data['legal_birth_from'] > $data['legal_birth_to']) {
      return response()->json(
        [
          'status' => 'fail',
          'message' => 'Registration period is not valid'
        ],
      406
      );
    }

    unset($data['reg_ids']);
    unset($data['club_ids']);

    Competition::where('id', $id)->update($data);

    return response()->json([
      'status' => 200
    ]);
  }

  public function show($id)
  {
    $competition = Competition::find($id);

    $orgs = CompetitionMembers::where('competition_id', $id)->get();

    $clubs = array();
    $regs = array();

    foreach ($orgs as $org) {
      $orgObj = Organization::find($org->club_id);

      if ($orgObj->is_club == 1) {
        if (!in_array($orgObj->id, $clubs)) {
          array_push($clubs, $orgObj->id);
        }
        
        $orgObj = Organization::find($orgObj->parent_id);
      }

      if (!in_array($orgObj->id, $regs)) {
        array_push($regs, $orgObj->id);
      }
    }

    $competition->club_ids = sizeof($clubs);
    $competition->reg_ids = sizeof($regs);

    return response()->json([
      'status' => 200,
      'competition' => $competition
    ]);
  }

  public function all()
  {
    $competitions = Competition::get();

    return response()->json([
      'status' => 200,
      'competitions' => $competitions
    ]);
  }

  public function clubs(Request $request)
  {
    $input = $request->all();
    
    if ($input['club_id'] == '' || is_null($input['club_id'])) {
      $comps = CompetitionMembers::where('competition_id', $input['competition_id'])->get();

      $club_ids = array();

      foreach ($comps  as $comp) {
        array_push($club_ids, $comp->club_id);
      }

      $clubs = Organization::leftJoin('organizations AS org', 'org.id', '=', 'organizations.parent_id')
                          ->whereIn('organizations.id', $club_ids)
                          ->select('organizations.id', 'organizations.name_o AS club_name', 'org.name_o AS reg_name')
                          ->get();
    } else {
      $clubs = Organization::leftJoin('organizations AS org', 'org.id', '=', 'organizations.parent_id')
                          ->where('organizations.id', $input['club_id'])
                          ->select('organizations.id', 'organizations.name_o AS club_name', 'org.name_o AS reg_name')
                          ->get();
    }

    $result = $this->getClubs($input['competition_id'], $clubs);

    return response()->json([
      'status' => 200,
      'result' => $result
    ]);
  }

  public function members(Request $request)
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

    $competition = CompetitionMembers::where('competition_id', $data['competition_id'])
                    ->whereIn('club_id', $orgids)
                    ->get();

    $memids = array();

    for ($i = 0; $i < sizeof($competition); $i++) {
      $ids = explode(',', $competition[$i]->member_ids);
      $memids = array_merge($memids, $ids);
    }

    $members = Member::leftJoin('players', 'players.member_id', '=', 'members.id')
                    ->leftJoin('roles', 'roles.id', '=', 'members.role_id')
                    ->leftJoin('organizations', 'organizations.id', '=', 'members.organization_id')
                    ->whereIn('members.id', $memids)
                    ->select('members.*', 'organizations.name_o as org_name', 'roles.name as role_name',
                              'players.weight', 'players.dan')
                    ->orderBy('members.role_id')
                    ->orderBy('members.surname')
                    ->get();

    return response()->json([
      'status' => 200,
      'data' => $members
    ]);
  }

  public function org_members(Request $request)
  {
    $data = $request->all();

    $competition = CompetitionMembers::where('competition_id', $data['competition_id'])
                    ->where('club_id', $data['org_id'])
                    ->get();

    $memids = explode(',', $competition[0]->member_ids);

    $members = Member::leftJoin('players', 'players.member_id', '=', 'members.id')
                    ->leftJoin('roles', 'roles.id', '=', 'members.role_id')
                    ->leftJoin('organizations', 'organizations.id', '=', 'members.organization_id')
                    ->whereIn('members.id', $memids)
                    ->select('members.*', 'organizations.name_o as org_name', 'roles.name as role_name',
                              'players.weight', 'players.dan')
                    ->orderBy('members.role_id')
                    ->orderBy('members.surname')
                    ->get();

    return response()->json([
      'status' => 200,
      'data' => $members
    ]);
  }

  public function getClubs($competition_id, $clubs)
  {
    $result = array();

    foreach ($clubs as $club) {
      $comp = CompetitionMembers::where('competition_id', $competition_id)
                      ->where('club_id', $club->id)
                      ->get();

      $male = 0;
      $female = 0;
      $officer = 0;
      $status = 2;

      if (sizeof($comp) > 0) {
        $member_ids = explode(',', $comp[0]->member_ids);

        $members = Member::whereIn('id', $member_ids)->get();

        foreach ($members as $member) {
          if ($member->role_id == 4) {
            if ($member->gender == 1)
                $male++;
            else
                $female++;
          } else {
            $officer++;
          }
        }

        $status = $comp[0]->status;

        $club['male'] = $male;
        $club['female'] = $female;
        $club['officer'] = $officer;
        $club['status'] = $status;

        array_push($result, $club);
      }
    }

    return $result;
  }

  public function check(Request $request)
  {
    $data = $request->all();

    $competition = CompetitionMembers::where('competition_id', $data['competition_id'])
                        ->where('club_id', $data['club_id'])
                        ->get();

    $status = 0;

    if (sizeof($competition) > 0) {
      $status = $competition[0]->status;
    }

    return response()->json([
      'status' => 200,
      'data' => $status
    ]);
  }

  public function attend(Request $request)
  {
    $data = $request->all();

    $myOrg = Organization::find($data['org_id']);

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

    $compClubs = CompetitionMembers::where('competition_id', $data['competition_id'])
                    ->whereIn('club_id', $orgids)
                    ->select('club_id')
                    ->get();

    $clubs = Member::whereIn('id', $data['members'])
                    ->select('organization_id as club_id')
                    ->groupBy('organization_id')
                    ->get();

    $club_ids = array();

    foreach ($clubs as $club) {
      array_push($club_ids, $club->club_id);

      $members = Member::whereIn('id', $data['members'])
                      ->where('organization_id', $club->club_id)
                      ->orderBy('organization_id')
                      ->orderBy('role_id')
                      ->orderBy('name')
                      ->get();

      $mem_ids = '';

      foreach($members as $member) {
        $mem_ids .= $member->id . ',';
      }

      $mem_ids = substr($mem_ids, 0, strlen($mem_ids) - 1);

      $compMembers = CompetitionMembers::where('competition_id', $data['competition_id'])
                      ->where('club_id', $club->club_id)
                      ->get();

      if (sizeof($compMembers) > 0) {
        CompetitionMembers::where('competition_id', $data['competition_id'])
                      ->where('club_id', $club->club_id)
                      ->update([
                        'member_ids' => $mem_ids
                      ]);
      } else {
        CompetitionMembers::create(array(
          'competition_id' => $data['competition_id'],
          'club_id' => $club->club_id,
          'member_ids' => $mem_ids,
          'status' => 0
        ));
      }
    }

    foreach ($compClubs as $compClub) {
      if (!in_array($compClub->club_id, $club_ids)) {
        CompetitionMembers::where('competition_id', $data['competition_id'])
                    ->where('club_id', $compClub->club_id)
                    ->delete();
      }
    }

    return response()->json([
      'status' => 'success'
    ], 200);
  }
}