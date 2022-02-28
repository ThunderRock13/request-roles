
const rolekey = "rolekeyid"

const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');



module.exports = {
    name: "requestrole",
    description: "add role to user",
    perms: "MANAGE_ROLES",
    options: [
        {
            name: "user",
            description: "user to add the role too",
            type: 6,
            required: true,
        },
        {
            name: "role",
            description: "user to add the role too",
            type: 8,
            required: true,
        },
    ],
    limits: {
        owner: false,
        cooldown: "3s"
    },

    run: (client, interaction, message) => {

        let member = interaction.options.getMember("user")
        let role = interaction.options.getRole("role")
        if (member.roles.cache.has(role.id)) return interaction.reply("The user already has the role.")
        let author = client.users.cache.get(interaction.member.user.id)
        interaction.reply({ content: `${member} was requested to get the role you specified. They will be either approved or denied the role. Please wait for it to be reviewed.`, ephemeral: true });
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Role Request')
            .setDescription(`${author} requested that ${member} gets ${role}`)
            .setTimestamp()
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('yes')
                    .setLabel('Yes')
                    .setStyle('PRIMARY'),
            );
        const row1 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('no')
                    .setLabel('No')
                    .setStyle('DANGER'),
            );
        try {
                client.channels.fetch('rolereviewchannelid').then((channel) => {
                    channel.send({ embeds: [embed], components: [row, row1]})
                    const filter = m => m.customId === 'yes' || 'no' && m.member.roles.cache.has(rolekey.id) && m.channel.id === 'rolereviewchannelid'

                    const collector = channel.createMessageComponentCollector({ filter: filter, max: 1, time: 86400*1000 });
                    collector.on('collect', async i => {
                        if (i.customId === 'yes' && i.member.roles.cache.has(rolekey)) {
                            member.roles.add(role)
                            i.reply(`${member} was given his role.`);
                            collector.stop()
                        } else {
                            i.reply({ content: `${member} was not given his role. Either from a permission error (you need Role Key) or a bot error (very unlikely).`});
                            collector.stop()
                        }
                    }
                )})


            } catch (e) {
                console.error(e)
        }
    }};