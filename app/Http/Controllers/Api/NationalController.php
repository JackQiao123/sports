<?php

namespace App\Http\Controllers\Api;

use App\User;
use App\Member;
use App\Organization;
use App\Setting;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

use DB;

class NationalController extends Controller
{
  public function list()
  {
    $nfs = Organization::where('parent_id', 0)->get();

    return response()->json([
      'status' => 200,
      'nfs' => $nfs
    ]);
  }

  public function store(Request $request)
  {
    $data = $request->all();

    $validator = Validator::make($data, [
      'name_o' => 'required|string|max:255',
      'name_s' => 'required|string|max:255',
      'email' => 'required|string|email|max:255|unique:organizations',
      'mobile_phone' => 'required|string|max:255',
      'addressline1' => 'required|string|max:255',
      'country' => 'required|string|max:255|unique:organizations',
      'state' => 'required|string|max:255',
      'city' => 'required|string|max:255',
      'zip_code' => 'required|string|max:255'
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

          $image = substr($base64_image, strpos($base64_image, ',') + 1);
          $image = base64_decode($image);
          
          Storage::disk('local')->put($filename . $type, $image);

          $data['logo'] = "photos/" . $filename . $type;
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
            
      $nf = Organization::create(array(
          'parent_id' => 0,
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
          'level' => 1,
          'is_club' => 0
      ));

      $member = Member::create(array(
          'organization_id' => $nf->id,
          'role_id' => 1,
          'name' => 'Federation',
          'surname' => 'Manager',
          'profile_image' => '',
          'gender' => 1,
          'birthday' => date('Y-m-d'),
          'position' => 'NF manager',
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
        'is_nf' => 1
      ));

      Setting::create(array(
        'organization_id' => $nf->id,
        'price' => 0.00,
        'percent' => 10.00
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
}