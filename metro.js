/*
* Flat Pyramid-style Metronome using HTML5 Web Audio API and CSS3 Keyframe Animations.
*
* Forked from Dylan Paulus' Pen "Simple Metronome" (http://codepen.io/ganderzz/pen/Ezlfu/), with the help of Chris Wilson's Tut "Scheduling Web Audio with Precision" (http://www.html5rocks.com/en/tutorials/audio/scheduling/).
* Design based on Alex Bergin's "M-Metronome" (http://codepen.io/abergin/pen/efbCD).
*
* Copyright 2015 GetSongBPM.com
* This project is licensed under the MIT License (see the LICENSE.md for details)
*/

	// Defaults
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	var context = new AudioContext();
	var timer, noteCount, counting, _interval = null;
	var curTime = 0.0;

	// Onload: Show beats
	$("document").ready(function() {
		showBeats();
	});

	//Scheduler
	function schedule() {
		while(curTime < context.currentTime + 0.1) {
			playNote(curTime);
			updateTime();
		}
		timer = window.setTimeout(schedule, 0.1);
	}

	// BPM to Time
	function updateTime() {
		curTime += seconds_perbeat();
		noteCount++;
	}

	// Seconds per beat
	function seconds_perbeat() {
		var current_tempo = parseInt($(".bpm-input").val(), 10);

		// Min/Max Put Limits
		if(current_tempo < 40) {
			current_tempo = 40;
			$(".bpm-input").val(current_tempo);
		} else if(current_tempo > 210) {
			current_tempo = 210;
			$(".bpm-input").val(current_tempo);
		}

		var adjust_weight = current_tempo - 35;

		$( "<style>.swinging_pendulum:before { margin-top: " + adjust_weight + "px; }</style>" ).appendTo( "head" );

		var spb = 60 / current_tempo;

		return spb;
	}

	// Play note on a delayed interval of t
	function playNote(t) {
		var note = context.createOscillator();

		if(noteCount == parseInt($(".new_beats").val(), 10) )
			noteCount = 0;

		if( $(".beatcount .beat").eq(noteCount).hasClass("active") ) {
			note.frequency.value = 380;
			var bgcolor = "19FA65";
			var first_beat = true;
		} else {
			note.frequency.value = 200;
			var bgcolor = "01C0F1";
		}

		note.connect(context.destination);

		note.start(t);
		note.stop(t + 0.05);

		$(".beatcount .beat").attr("style", "");

		$(".beatcount .beat").eq(noteCount).css({
			background: "#" + bgcolor
		});

		$(".current_beat").text(noteCount+1);

	}

	// Pendulum
	pendulum_speed();

	function pendulum_speed() {
		var duration = seconds_perbeat() + 's';

		$('.swinging_pendulum').css({
			'-webkit-animation-duration': duration,
			'-moz-animation-duration': duration,
			'-o-animation-duration': duration,
			'animation-duration': duration
		});
	}

	// Increase or decrease Tempo
	$(".slow-down, .speed-up").click(function() {
		if($(this).hasClass("slow-down"))
			$(".bpm-input").val(parseInt($(".bpm-input").val(), 10) - 1 );
		else
			$(".bpm-input").val(parseInt($(".bpm-input").val(), 10) + 1 );

		$(this).blur();

		pendulum_speed();
	});

	// Allow keyboard controls
	$(document).on('keydown', function(e) {
		var amount = 1;

		if (e.shiftKey)
			amount = 10;

		if (e.keyCode == 107 || e.keyCode == 39) { // + or ->
			$(".bpm-input").val(parseInt($(".bpm-input").val(), 10) + amount );
			pendulum_speed();
		} else if (e.keyCode == 109 || e.keyCode == 37) { // - or <-
			$(".bpm-input").val(parseInt($(".bpm-input").val(), 10) - amount );
			pendulum_speed();
		} else if (e.keyCode == 32) { // spacebar
			metronome_switch();
		} else if (e.keyCode == 13) { // enter
			if(!$('.swinging_pendulum').hasClass('animate_pendulum'))
				metronome_on();
		} else if (e.keyCode == 27) { // escape
			metronome_off();
		}
	});

	// Start/Stop
	$("#metronome_switcher").on( "click", function() {
		metronome_switch();
	});

	// Switcher
	function metronome_switch( ) {

		if($('.swinging_pendulum').hasClass('animate_pendulum'))
			metronome_off();
		else
			metronome_on();

	}

	// Switch on
	function metronome_on() {
		curTime = context.currentTime;
		noteCount = parseInt($(".new_beats").val(), 10);
		schedule();

		$("#metronome_switcher").prop( "checked", true );

		// Pendulum Stuff
		$('.swinging_pendulum').addClass('animate_pendulum');
		_interval = setInterval(function() {}, seconds_perbeat() * 1000);
	}

	// Switch off
	function metronome_off() {
		counting = false;
		window.clearInterval(timer);

		$("#metronome_switcher").prop( "checked", false );
		$(".beatcount .beat").attr("style", "");
		$(".current_beat").empty();

		// Pendulum Stuff
		$('.swinging_pendulum').removeClass('animate_pendulum');
		clearInterval(_interval);
		_interval = null;
	}

	// Beats per measure
	$(document).mouseup(function (e) {
		var ts = $(".per_measure");

		if ( $(e.target).is('.n_beats_change') || (ts.is(":visible") && !ts.is(e.target) && ts.has(e.target).length === 0) )
			ts.toggle(200);
	});

	// Show beats using dots
	function showBeats() {

		for(var i = 0; i < $(".new_beats").val(); i++) {
			var temp = document.createElement("div");
			temp.className = "beat";

			if(i === 0)
				temp.className += " active";

			$(".beatcount").append( temp );
		}
	}

	// Enable accents
	$(document).on("click", ".beatcount .beat", function() {
		$(this).toggleClass("active");
	});


	// Add/remove dots when number of beats per measure changes
	$(".new_beats").on("change", function() {
		var _counter = $(".beatcount");
		_counter.html("");

		//var time_sig = parseInt($(".new_beats option:selected").val(), 10);
		var time_sig = $(".new_beats").val();

		if(time_sig < noteCount)
			noteCount = 0;

		showBeats();

		if( $(".per_measure").is(":visible") )
			$(".per_measure").toggle(200);
	});
