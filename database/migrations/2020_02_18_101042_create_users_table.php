<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

use Illuminate\Support\Facades\Hash;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('member_id');

            $table->string('password', 100);
            $table->string('email')->unique();

            $table->boolean('is_nf');
            $table->rememberToken();

            $table->timestamps();
            $table->softDeletes();
        });

        DB::table('users')->insert(
            array(
                'member_id' => 0,
                'password' => Hash::make('123456'),
                'email' => 'superadmin@gmail.com',
                'is_nf' => true,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            )
        );
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
