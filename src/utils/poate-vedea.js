function poateVedea(utilizator, reteta)
{
    if(reteta.vizibilitate === 'public')
    {
        return true;
    }

    if(!utilizator)
    {
        return false;
    }

    return utilizator.id === reteta.autor_id || utilizator.rol === 'admin';
}

module.exports = {poateVedea};