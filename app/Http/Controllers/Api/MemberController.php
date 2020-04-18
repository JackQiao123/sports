<?php

namespace App\Http\Controllers\API;

use App\Member;
use App\Organization;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

use DB;

class MemberController extends Controller
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
    
    $validMember = Validator::make($data, [
      'organization_id' => 'required',
      'role_id' => 'required',
      'name' => 'required|string|max:255',
      'surname' => 'required|string|max:255',
      'gender' => 'required|boolean',
      'birthday' => 'required|date',
      'email' => 'required|string|email|max:255|unique:members',
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
      'weight_id' => 'required',
      'dan' => 'required'
    ]);
      
    $role = DB::table('roles')->where('id', $data['role_id'])->first();

    if ($role->is_player && $validPlayer->fails()) {
      return response()->json(
        [
          'status' => 'fail',
          'data' => $validPlayer->errors(),
        ],
        422
      );
    }

    $data['profile_image'] = "";
    
    $base64_image = $request->input('profile_image');
                  
    if ($base64_image != '' && preg_match('/^data:image\/(\w+);base64,/', $base64_image)) {
      $pos  = strpos($base64_image, ';');
      $type = explode(':', substr($base64_image, 0, $pos))[1];

      if (substr($type, 0, 5) == 'image') {
        $filename = $data['identity'] . '_' . date('Ymd');

        $type = str_replace('image/', '.', $type);

        $image = substr($base64_image, strpos($base64_image, ',') + 1);
        $image = base64_decode($image);
        
        Storage::disk('local')->put($filename . $type, $image);

        $data['profile_image'] = "photos/" . $filename . $type;
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

    $identity = '';

    $exist = Member::leftJoin('organizations', 'organizations.id', '=', 'members.organization_id')
              ->where('organizations.country', $data['country'])
              ->select('members.*')
              ->orderBy('members.id', 'DESC')
              ->first();

    for ($i = 0; $i < 8 - strlen($exist->id); $i++) {
        $identity .= '0';
    }

    $identity .= ($exist->id + 1);

    $member = Member::create(array(
      'organization_id' => $data['organization_id'],
      'role_id' => $data['role_id'],
      'name' => $data['name'],
      'surname' => $data['surname'],
      'profile_image' => $data['profile_image'],
      'gender' => $data['gender'],
      'birthday' => $data['birthday'],
      'email' => $data['email'],
      'position' => $data['position'],
      'identity' => $identity,
      'active' => $data['active'],
      'register_date' => $data['register_date']
    ));
      
    $member_id = $member->id;

    if ($role->is_player && !$validPlayer->fails()) {
      Player::create(array(
        'member_id' => $member_id,
        'weight_id' => $data['weight_id'],
        'dan' => $data['dan']
      ));
    }

    return response()->json([
      'status' => 'success'
    ], 200);
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