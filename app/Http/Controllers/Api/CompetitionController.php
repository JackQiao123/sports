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
    $competitions = Competition::where('from', 'like', date('Y') . '-%')
                    ->orderBy('from')
                    ->get();

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
        'level' => 'required|string|max:255',
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
        'level' => $data['level'],
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

  public function show($id)
  {
    $competition = Competition::find($id);

    $clubs = CompetitionMembers::where('competition_id', $id)->get();
    $club_ids = sizeof($clubs);

    $regs = array();
    foreach ($clubs as $club) {
      $clubObj = Organization::find($club->club_id);

      if (!in_array($clubObj->parent_id, $regs)) {
          array_push($regs, $clubObj->parent_id);
      }
    }
    $reg_ids = sizeof($regs);

    $competition->reg_ids = $reg_ids;
    $competition->club_ids = $club_ids;

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
          if ($member->role_id == 3) {
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
}