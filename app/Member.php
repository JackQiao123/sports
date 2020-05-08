<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Member extends Model
{
    use SoftDeletes;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'organization_id',
        'role_id',
        'name',
        'surname',
        'profile_image',
        'gender',
        'birthday',
        'position',
        'active',
        'register_date'
    ];
}
