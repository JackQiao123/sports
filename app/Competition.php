<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Competition extends Model
{
  use SoftDeletes;
  
  /**
   * The attributes that are mass assignable.
   *
   * @var array
   */
  protected $fillable = [
    'creator_id',
    'name',
    'short_name',
    'place',
    'type',
    'from',
    'to',
    'register_from',
    'register_to',
    'legal_birth_from',
    'legal_birth_to',
    'gender',
    'weights'
  ];
}
