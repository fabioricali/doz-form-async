import axios from 'axios'
import './style.css'

export default {

    props: {
        ajax: true,
        resetOnSuccess: true,
        classError: 'error',
        eventChangeOnLoad: true
    },

    onCreate() {
        this.$inputs = [];
        this.$form = {};
    },

    onMountAsync() {
        this.$retrieveForm();
        this.$retrieveFields();
    },

    $reset() {
        this.$form.reset();
    },

    $retrieveForm() {
        const form = this.$form = this.getHTMLElement().querySelector('form');
        form.addEventListener('submit', e => {

            e.preventDefault();

            const method = form.method.toLowerCase();

            const params = method === 'get' ? {params: this.$getData()} : this.$getData();

            this.emit('submit', this);

            if (this.props.ajax) {
                axios[method](form.action, params).then(response => {
                    if (this.props.resetOnSuccess) {
                        this.$reset();
                    }
                    this.emit('success', response, this);
                }).catch(error => {
                    this.emit('error', error, this);
                });
            } else {
                form.submit();
            }
        });
    },

    $retrieveFields() {
        this.$form.querySelectorAll('input, textarea, select').forEach(input => {
            if (input.name) {
                this.$inputs.push(input);

                input.addEventListener('invalid', () => {
                    this.emit('validationerror', {
                        name: input.name,
                        value: input.value,
                        message: input.validationMessage
                    }, this);
                    input.classList.add(this.props.classError);
                });

                input.addEventListener('input', () => {
                    input.classList.remove(this.props.classError);
                });

                input.addEventListener('blur', () => {
                    input.checkValidity();
                });
            }
        });
    },

    $getData() {
        const data = {};
        this.$inputs.forEach(input => {
            data[input.name] = input.value;
        });

        return data;
    },

    $loadData(data = {}) {
        this.$inputs.forEach(input => {
            if (data.hasOwnProperty(input.name)) {
                const oldValue = input.value;
                const newValue = data[input.name];
                input.value = data[input.name];
                if (this.props.eventChangeOnLoad && oldValue !== newValue)
                    input.dispatchEvent(new Event('change'));
            }
        });
    }

}