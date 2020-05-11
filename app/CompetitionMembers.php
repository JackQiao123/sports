<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class CompetitionMembers extends Model
{
  /**
   * The attributes that are mass assignable.
   *
   * @var array
   */
  protected $fillable = [
    'competition_id',
    'club_id',
    'member_ids',
    'status'
  ];
}