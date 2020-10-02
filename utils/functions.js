export async function checkout(callback, user) {
    if (!user)
        throw new Error('User doesn\'t exists or not authorized')

    try {
        await callback()
        return true
    } catch (err) {
        throw new Error('Server Error:', err.message)
    }
}

export async function publish(model, args={}, sub, pubsub, callback) {
    const documents = await model.find(args)
    pubsub.publish(sub, { [sub]: (callback) ? callback(documents) : documents })
    return documents
}

export async function create(model, args) {
    if (!model)
        throw new Error('Model was not provided')

    try {
        await model.create({
            ...args,
            user: user.id
        })
    } catch (err) {
        throw new Error('Server Error:', err.message)
    }
}

export async function edit(model, args) {
    if (!model)
        throw new Error('Model was not provided')
    
    try {
        const document = await model.findById(args.id)
        for (let [key, value] of Object.entries(args)) {
            if (value) document[key] = value
        }
        await document.save()
    } catch (err) {
        throw new Error('Server Error:', err.message)
    }
}

export async function remove(model, ids=[], formatted=false) {
    if (!model)
        throw new Error('Model was not provided')
    if (formatted)
        model = model.map(p => p.id)

    try {
        for (i of ids)
            await model.findById(i).deleteOne()
    } catch (err) {
        throw new Error('Server Error:', err.message)
    }
}