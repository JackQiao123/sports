<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCompetitionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('competitions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('creator_id');
            $table->string('name');
            $table->string('short_name');
            $table->string('place');
            $table->string('type');
            $table->string('level', 30);
            $table->date('from');
            $table->date('to');
            $table->date('register_from');
            $table->date('register_to');
            $table->year('legal_birth_from');
            $table->year('legal_birth_to');
            $table->string('gender', 10);
            $table->string('weights');
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
        Schema::dropIfExists('competitions');
    }
}
