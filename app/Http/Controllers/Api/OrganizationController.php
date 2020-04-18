<?php

namespace App\Http\Controllers\API;

use App\Organization;
use App\Member;
use App\Player;
use App\User;

use JWTAuth;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
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
                  ->leftJoin('weights', 'weights.id', '=', 'players.weight_id')
                  ->select('members.*', 'roles.name AS role_name', 'weights.weight', 'players.dan')
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
}