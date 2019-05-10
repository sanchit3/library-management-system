export default {
    name: /^[\w ]{4,120}$/,
    email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    pwd: /^(?=.*\d)(?=.*[@#$%^&*!~-])(?=.*[a-zA-Z]).{4,25}$/
};