// Created by Meehoweq @ 11/02/2019 11:20
const config = require('./config.json')
const axios = require('axios')

const Discord = require('discord.js')
const client = new Discord.Client()

client.on('ready', () => {
  console.info(`Zalogowano jako ${client.user.tag}.`)
})

client.on('message', message => {
  if (message.channel.id !== config.channelId) return
  if (message.content === '!help') {
    message.channel.send('Dostępne komendy: \`!userinfo\`')
  } else if (message.content.startsWith('!userinfo')) {
    let member = message.content.replace('!userinfo ', '')
    if (!member || member === '!userinfo') return message.channel.send('Nie podano nazwy użytkownika.')

    axios.get(`${config.ipsUrl}/api/core/members?name=${member}&key=${config.ipsApiToken}`)
      .then(response => {
        let member = response.data.results[0]
        if (!member) return message.channel.send(`Użytkownik **${member}** nie istnieje.`)

        let secondaryGroups = []
        if (member.secondaryGroups[0]) {
          member.secondaryGroups.forEach(group => {
            secondaryGroups.push(group.name)
          })
        } else {
          secondaryGroups.push('Brak')
        }

        let embed = new Discord.RichEmbed()
        embed.setAuthor(member.name, member.photoUrl, member.profileUrl)
          .setColor('DARK_AQUA')
          .setFooter('IPSLinker')
          .setThumbnail(member.photoUrl)
          .setImage(member.coverPhotoUrl) // max 25 pól
          .addField('ID', member.id)
          .addField('Nazwa użytkownika', member.name)
          .addField('Tytuł', member.title ? member.title : 'Brak')
          .addField('IP rejestracji', member.registrationIpAddress)
          .addField('Pierwszorzędna grupa', member.primaryGroup.name)
          .addField('Drugorzędne grupy', secondaryGroups.join(', '))
          .addField('E-mail', member.email)
          .addField('Dołączono', member.joined.replace('T', ' ').replace('Z', ''))
          .addField('Ostrzeżenia', member.warningPoints + ' pkt.')
          .addField('Reputacja', member.reputationPoints + ' pkt.')
          .addField('Podczas weryfikacji', member.validating ? '**TAK**' : '**NIE**')
          .addField('Posty', member.posts)
          .addField('Ostatnia aktywność', member.lastActivity ? member.lastActivity.replace('T', ' ').replace('Z', '') : 'Nigdy')
          .addField('Ostatnia wizyta', member.lastVisit ? member.lastVisit.replace('T', ' ').replace('Z', '') : 'Nigdy')

        return message.channel.sendEmbed(embed)
      })
      .catch(error => {
        message.channel.send(error.message)
      })
  }
})

client.login(config.token)
