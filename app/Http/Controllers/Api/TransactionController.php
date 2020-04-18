<?php

namespace App\Http\Controllers\Api;
use JWTAuth;

use App\Member;
use App\Organization;
use App\Transaction;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use DB;

class TransactionController extends Controller
{
  public function finance()
  {
    $nfs = array();
    $clubs = array();
    $players = array();

    $total = array();
    $subtotal = array();

    $nfs = Organization::where('parent_id', 0)->get();

    for ($i = 0; $i < sizeof($nfs); $i++) {
      $clubs[$i] = array();

      $orgs = Organization::where('parent_id', $nfs[$i]->id)->get();

      foreach ($orgs as $org) {
        if ($org->is_club == 1) {
          array_push($clubs[$i], $org->id);
        } else {
          $club = Organization::where('parent_id', $org->id)->get();

          foreach ($club as $c) {
            array_push($clubs[$i], $c->id);
          }
        }
      }

      $players[$i] = Member::whereIn('organization_id', $clubs[$i])
                    ->where('role_id', 3)
                    ->select('active', DB::raw('count(id) as player'))
                    ->groupBy('active')
                    ->get();

      $subtotal[$i] = Transaction::whereIn('club_id', $clubs[$i])
                    ->where('created_at', 'like', date('Y') . '%')
                    ->select(DB::raw('DATE_FORMAT(created_at, "%m") month'), DB::raw('sum(amount) as amount'))
                    ->groupBy('month')
                    ->get();
    }

    for ($i = 0; $i < sizeof($clubs); $i++) {
      $sum = Transaction::whereIn('club_id', $clubs[$i])
                  ->where('created_at', 'like', date('Y') . '%')
                  ->select(DB::raw('sum(amount) as amount'))
                  ->groupBy('club_id')
                  ->get();

      $total[$i] = 0;
      foreach ($sum as $value) {
        $total[$i] += round($value->amount * 100);
      }
    }

    return response()->json([
      'status' => 'success',
      'total' => $total,
      'subtotal' => $subtotal,
      'nfs' => $nfs,
      'players' => $players
    ], 200);
  }

  public function detail($nf_id)
  {
    $clubs = array();

    $nf = Organization::find($nf_id);

    $orgs = Organization::where('parent_id', $nf->id)->get();

    foreach ($orgs as $org) {
      if ($org->is_club == 1) {
        array_push($clubs, $org->id);
      } else {
        $club = Organization::where('parent_id', $org->id)->get();

        foreach ($club as $c) {
          array_push($clubs, $c->id);
        }
      }
    }

    $detail = Transaction::whereIn('club_id', $clubs)
                    ->leftJoin('organizations AS org1', 'org1.id', '=', 'transactions.club_id')
                    ->leftJoin('organizations AS org2', 'org2.id', '=', 'org1.parent_id')
                    ->where('transactions.created_at', 'like', date('Y') . '%')
                    ->select('transactions.*', 
                            'org2.id AS reg_id', 'org2.name_o AS reg', 
                            'org1.id AS club_id', 'org1.name_o AS club')
                    ->orderBy('transactions.created_at', 'desc')
                    ->get();

    return response()->json([
      'status' => 'success',
      'detail' => $detail,
    ], 200);
  }
}