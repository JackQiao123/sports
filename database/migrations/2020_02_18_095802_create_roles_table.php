<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRolesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->string('name', 50);
            $table->string('description', 200);
            $table->boolean('is_player');

            $table->timestamps();
            $table->softDeletes();
        });

        DB::table('roles')->insert(
            array(
                'name' => 'Official Staff',
                'description' => 'staff',
                'is_player' => false,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            )
        );

        DB::table('roles')->insert(
            array(
                'name' => 'Coach',
                'description' => 'coach',
                'is_player' => false,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            )
        );

        DB::table('roles')->insert(
            array(
                'name' => 'Referee',
                'description' => 'referee',
                'is_player' => false,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            )
        );
        
        DB::table('roles')->insert(
            array(
                'name' => 'Judoka',
                'description' => 'judoka',
                'is_player' => true,
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
        Schema::dropIfExists('roles');
    }
}
