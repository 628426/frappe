import JsBarcode from 'jsbarcode';

frappe.ui.form.ControlBarcode = frappe.ui.form.ControlData.extend({
	make_wrapper() {
		// Create the elements for barcode area
		this._super();

		this.default_svg = '<svg height=80></svg>';
		let $input_wrapper = this.$wrapper.find('.control-input-wrapper');
		this.barcode_area = $(
			`<div class="barcode-wrapper border">${this.default_svg}</div>`
		);
		this.barcode_area.appendTo($input_wrapper);
	},

	parse(value) {
		// Parse raw value
		if (value) {
			if (value.startsWith('<svg')) {
				return value;
			}
			return this.get_barcode_html(value);
		}
		return '';
	},

	set_formatted_input(value) {
		// Set values to display
		let svg = value;
		let barcode_value = '';

		if (value && value.startsWith('<svg')) {
			barcode_value = $(svg).attr('data-barcode-value');
		}

		if (!barcode_value && this.doc) {
			svg = this.get_barcode_html(value);
			this.doc[this.df.fieldname] = svg;
		}

		this.$input.val(barcode_value || value);
		this.barcode_area.html(svg || this.default_svg);
	},

	get_barcode_html(value) {
		if (value) {
			// Get svg
			const svg = this.barcode_area.find('svg')[0];
			JsBarcode(svg, value, this.get_options(value));
			$(svg).attr('data-barcode-value', value);
			return this.barcode_area.html();
		}
	},

	get_options(value) {
		// get JsBarcode options
		let options = JSON.parse('{ "height" : 40 }');
		if (frappe.utils.is_json(this.df.options)) {
			options = JSON.parse(this.df.options);
			if (options.format && options.format === 'EAN') {
				options.format = value.length == 8 ? 'EAN8' : 'EAN13';
			}

			if (options.valueField) {
				// Set companion field value
				this.frm && this.frm.set_value(options.valueField, value);
			}
		}
		return options;
	}
});
