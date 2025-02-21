$(document).ready(function () {
    function spawnCircle() {
        var circleNumber = Math.floor(Math.random() * 4) + 1; // Random number from 1 to 4
        var playArea = $("#playArea");

        var maxTop = playArea.height() - 50;
        var maxLeft = playArea.width() - 50;

        var circle = $("<img>")
            .attr("src", "assets/img/hitCircs" + circleNumber + ".png")
            .addClass("osu-circle")
            .css({
                position: "absolute",
                top: Math.max(7 * parseFloat($("body").css("font-size")), Math.random() * maxTop), // Prevents spawning in top 7em
                left: Math.random() * maxLeft,
                width: "50px",
                height: "50px",
                cursor: "pointer",
            });

        playArea.append(circle);

        circle.on("click", function () {
            $(this).fadeOut(200, function () {
                $(this).remove();
            });
        });

        setTimeout(function () {
            circle.fadeOut(200, function () {
                $(this).remove();
            });
        }, 2000); // Circles disappear if not clicked in 2 seconds
    }

    setInterval(spawnCircle, 1000); // Spawn new circle every second
});
