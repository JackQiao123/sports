<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::namespace('Api')->group(function () {
	Route::post('login', 'UserController@login');
	Route::post('forgot', 'ForgotPasswordController@forgot');
	Route::post('reset/{token}', 'ForgotPasswordController@reset');
	
	Route::group(['middleware' => ['jwt.verify']], function () {
		// Super Admin APIs
		Route::get('all-nf', 'NationalController@list');
		Route::post('create-nf', 'NationalController@store');

		// Organization APIs
		Route::get('search', 'OrganizationController@search');

		Route::get('organization/{id}', 'OrganizationController@show');
		Route::get('organization-list/{id}', 'OrganizationController@orgList');
		Route::get('organization-child/{id}', 'OrganizationController@child');
		Route::get('club-list/{id}', 'OrganizationController@clubList');
		Route::get('countryclubs/{id}', 'OrganizationController@country_clubs');
		Route::post('reg-organization', 'OrganizationController@store');
		Route::put('organization/{id}', 'OrganizationController@update');
		Route::delete('organization/{id}', 'OrganizationController@destroy');

		// Member APIs
		Route::post('members', 'MemberController@index');
		Route::get('roles', 'MemberController@roles');
		Route::post('reg-member', 'MemberController@store');
		Route::get('member/{id}', 'MemberController@show');
		Route::put('member/{id}', 'MemberController@update');
		Route::delete('member/{id}', 'MemberController@destroy');

		// Judoka APIs
		Route::get('weights', 'PlayerController@weights');

		// User APIs
		Route::post('resetpass/{token}', 'UserController@reset');
		Route::get('allsetting', 'SettingController@allsetting');
		Route::put('setting/{id}', 'SettingController@update');

		// Financial APIs
		Route::get('finance', 'TransactionController@finance');
		Route::get('transdetail/{id}', 'TransactionController@detail');
	});
});