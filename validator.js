function Validator(formSelector, options) {

    function getParent (element, selector) {
        while(element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var formRules = {
        required(value) {
            return value ? undefined : 'Vui lòng nhập trường này'; 
        },
        email(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email';
        },
        min(min){
            return function(value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} kí tự`
            }
        },
        isConfirmed(password) {
            return function(value) {
                return value === document.querySelector(`#register-form ${password}`).value ? undefined : 'Nhập lại mật khẩu không chính xác';
            }
        }
    }
    
    //Lấy form cần validate
    var formElement = document.querySelector(formSelector);


    //form onSubmit
    formElement.onsubmit = function(e) {
        e.preventDefault();
        var isFormValid = true;
        var inputElements = formElement.querySelectorAll('[name][rules]')

        var formValues = Array.from(inputElements).forEach(function (input) {

            if (!handleValidate({ target: input })) {
                isFormValid = false;
            }
        })

        if(isFormValid) {
            if(typeof options.onSubmit === 'function') {
                var formValues = Array.from(inputElements).reduce(function (values, input) {
                    switch(input.type) {
                        case 'checkbox':
                            if(!input.matches(':checked')) {
                                if (!values[input.name]) {
                                    values[input.name] = '';
                                }
                                return values;
                            }
                            if(!Array.isArray(values[input.name])) {
                                values[input.name] = []
                            }
                            values[input.name].push(input.value)
                            break;
                            case 'radio':
                                if (input.matches(':checked')) {
                                    values[input.name] = input.value;
                                }
                                if (!(values[input.name])) {
                                    values[input.name] = '';
                                }
                            break;
                        case 'file':
                            values[input.name] = input.files;
                            break;
                        default:
                            values[input.name] = input.value;
                    }
                    return values;
                }, {})
                options.onSubmit(formValues)
            } else {
                formElement.submit();
            }
        } 
        



    }

    //Lấy các input
    var inputElements = formElement.querySelectorAll('[name][rules]')

    var formInfo = {};
    var minFunc = {}

    Array.from(inputElements).forEach(function (input) {

        var rules = input.getAttribute('rules').split('|')
        
        for(var i in rules) {
            if(rules[i].includes(':')) {
                minFunc[input.name] = rules[i].split(':')
                rules[i] = minFunc[input.name][0]
            }
            if(!Array.isArray(formInfo[input.name])) {
                formInfo[input.name] = [];
            }
            formInfo[input.name].push(formRules[rules[i]])
        }
        input.onblur = handleValidate;

        input.oninput = cancelValidate;
    })



    function cancelValidate(e) {
        getParent(e.target, '.form-group').querySelector('.form-message').innerText = ''
        getParent(e.target, '.form-group').classList.remove('invalid');
    }


    function handleValidate(e) {
        
        var rules = formInfo[e.target.name];
        for(var i = 0; i < rules.length; i++) {
            var errorMessage;
            switch(e.target.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](formElement.querySelector('input[name="' + e.target.name + '"]:checked'));
                    break;
                default:
                    if (!(typeof rules[i]() === 'function')) {
                        errorMessage = rules[i](e.target.value)
                    } else {
                        errorMessage = rules[i](minFunc[e.target.name][1])(e.target.value)
                    }
            }
            if(errorMessage) {
                getParent(e.target, '.form-group').classList.add('invalid');
                getParent(e.target, '.form-group').querySelector('.form-message').innerText = errorMessage;
                break;
            } else {
                getParent(e.target, '.form-group').querySelector('.form-message').innerText = ''
                getParent(e.target, '.form-group').classList.remove('invalid');
            }
        }

        return !errorMessage;
    }

}