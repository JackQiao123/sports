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
		Route::get('organization/{id}', 'OrganizationController@show');
		Route::get('organization-child/{id}', 'OrganizationController@child');
		Route::get('countryclubs/{id}', 'OrganizationController@country_clubs');

		// Judoka APIs
		Route::get('weights', 'PlayerController@weights');

		// Financial APIs
		Route::get('finance', 'TransactionController@finance');
		Route::get('transdetail/{id}', 'TransactionController@detail');
	});
});