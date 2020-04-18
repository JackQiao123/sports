<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Organization extends Model
{
  use SoftDeletes;
  
  /**
   * The attributes that are mass assignable.
   *
   * @var array
   */
  protected $fillable = [
    'parent_id',
    'register_no',
    'name_o',
    'name_s',
    'logo',
    'email',
    'mobile_phone',
    'addressline1',
    'addressline2',
    'country',
    'state',
    'city',
    'zip_code',
    'level',
    'is_club'
  ];
}
