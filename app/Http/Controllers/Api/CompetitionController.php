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
}