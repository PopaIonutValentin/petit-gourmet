function citesteId(text)
{
    const id = Number(text);

    if(Number.isSafeInteger(id) && id >= 1)
    {
        return id;
    }

    return null;
}

module.exports = {citesteId};