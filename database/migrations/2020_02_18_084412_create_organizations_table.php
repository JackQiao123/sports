<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOrganizationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('parent_id');

            $table->string('name_o', 50);
            $table->string('name_s', 10);
            $table->string('logo', 100);            
            $table->string('email')->unique();
            $table->string('mobile_phone', 50);

            $table->string('addressline1', 50);
            $table->string('addressline2', 50)->default("");
            $table->string('country', 50);
            $table->string('state', 50);
            $table->string('city', 50);
            $table->string('zip_code', 20);

            $table->tinyInteger('level');
            $table->boolean('is_club');
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('organizations');
    }
}
