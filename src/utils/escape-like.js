function escapeLike(text)
{
    return text.replace(/[!%_]/g, (caracter) => '!' + caracter);
}

module.exports = {escapeLike};