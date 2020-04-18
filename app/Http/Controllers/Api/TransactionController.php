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
}