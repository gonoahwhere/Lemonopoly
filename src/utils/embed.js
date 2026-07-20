import SilentContainer from 'silent-container';
import config from '../../config.js';

export function successEmbed(title, description) {
    const container = new SilentContainer()
        .setStatus('success')
        .addText(`${config.emoji('misc', 'enabled')} ${title}`)

    if (description) {
        container.addDivider()
        container.addText(description)
    }

    return container
}

export function errorEmbed(title, description) {
    const container = new SilentContainer()
        .setStatus('error')
        .addText(`${config.emoji('misc', 'disabled')} ${title}`)

    if (description) {
        container.addDivider()
        container.addText(description)
    }

    return container
}

export function infoEmbed(title, description) {
    const container = new SilentContainer()
        .setStatus('info')
        .addText(`${config.emoji('misc', 'info')} ${title}`)

    if (description) {
        container.addDivider()
        container.addText(description)
    }

    return container
}

export function warningEmbed(title, description) {
    const container = new SilentContainer()
        .setStatus('warning')
        .addText(`${config.emoji('misc', 'warning')} ${title}`)

    if (description) {
        container.addDivider()
        container.addText(description)
    }

    return container
}