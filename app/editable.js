function bindEditableEvent() {
    $(".editable").off("click");
    $(".editable-input").off("focusout");

	$(".editable").click(event => {
		let editable = $(event.target);
		let input = editable.parent().find(".editable-input");
		input.val(editable.text());
		editable.hide();
		input.show();
		input.focus();
	});
	
	$(".editable-input").focusout(event => {
		let input = $(event.target);
		let editable = input.parent().find(".editable");
		editable.text(input.val());
		input.hide();
		editable.show();		
	});

	$(".editable-input").keypress(event => {
		if (event.which == 13) {
			let input = $(event.target);
			let editable = input.parent().find(".editable");
			editable.text(input.val());
			input.hide();
			editable.show();
		}
	});
}