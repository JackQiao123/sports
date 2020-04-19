<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateWeightsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('weights', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->string('name', 20);
            $table->string('weight', 10);
            $table->string('type', 30);
            $table->boolean('gender');
            $table->smallInteger('order');

            $table->timestamps();
            $table->softDeletes();
        });

        DB::table('weights')->insert(
            array(
                'name' => 'All',
                'weight' => 'All',
                'type' => 'All',
                'gender' => 0,
                'order' => 0,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            )
        );


        $name = array(
            'Extra-lightweight', 'Half-lightweight', 'Lightweight', 'Half-middleweight',
            'Middleweight', 'Half-heavyweight', 'Heavyweight',
            'Featherweight', 'Extra-lightweight', 'Half-lightweight', 'Lightweight',
            'Half-middleweight', 'Middleweight', 'Half-heavyweight', 'Heavyweight',
            'Extra-lightweight', 'Half-lightweight', 'Lightweight', 'Half-middleweight',
            'Middleweight', 'Half-heavyweight', 'Heavyweight',
            'Featherweight', 'Extra-lightweight', 'Half-lightweight', 'Lightweight',
            'Half-middleweight', 'Middleweight', 'Half-heavyweight', 'Heavyweight'
        );

        $weight = array(
            '-60', '-66', '-73', '-81', '-90', '-100', '+100',
            '-50', '-55', '-60', '-66', '-73', '-81', '-90', '+90',
            '-48', '-52', '-57', '-63', '-70', '-78', '+78',
            '-40', '-44', '-48', '-52', '-57', '-63', '-70', '+70'
        );

        $type = array(
            'senior-junior', 'senior-junior', 'senior-junior', 'senior-junior', 'senior-junior', 'senior-junior', 'senior-junior',
            'cadet', 'cadet', 'cadet', 'cadet', 'cadet', 'cadet', 'cadet', 'cadet',
            'senior-junior', 'senior-junior', 'senior-junior', 'senior-junior', 'senior-junior', 'senior-junior', 'senior-junior',
            'cadet', 'cadet', 'cadet', 'cadet', 'cadet', 'cadet', 'cadet', 'cadet'
        );

        $gender = array(
            1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1,
            2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2, 2
        );

        for ($i = 0; $i < sizeof($weight); $i++) {
            DB::table('weights')->insert(
                array(
                    'name' => $name[$i],
                    'weight' => $weight[$i],
                    'type' => $type[$i],
                    'gender' => $gender[$i],
                    'order' => $i + 1,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                )
            );
        }

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('weights');
    }
}
