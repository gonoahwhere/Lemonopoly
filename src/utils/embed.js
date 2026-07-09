import SilentContainer from 'silent-container';
import config from '../../config.js';

export function successEmbed(title, description) {
    const container = new SilentContainer()
        .setStatus('success')
        .addText(`${config.emojis.misc.enabled} ${title}`)

    if (description) {
        container.addDivider()
        container.addText(description)
    }
    
    return container
}

export function errorEmbed(title, description) {
    const container = new SilentContainer()
        .setStatus('error')
        .addText(`${config.emojis.misc.disabled} ${title}`)

    if (description) {
        container.addDivider()
        container.addText(description)
    }

    return container
}

export function infoEmbed(title, description) {
    const container = new SilentContainer()
        .setStatus('info')
        .addText(`${config.emojis.misc.info} ${title}`)

    if (description) {
        container.addDivider()
        container.addText(description)
    }

    return container
}

export function warningEmbed(title, description) {
    const container = new SilentContainer()
        .setStatus('warning')
        .addText(`${config.emojis.misc.warning} ${title}`)
    
    if (description) {
        container.addDivider()
        container.addText(description)
    }

    return container
}