'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {

    async create(ctx) {
        let entity;
        if (ctx.is('multipart')) {
            const { data, files } = parseMultipartData(ctx);
            data.user = ctx.state.user.id;
            entity = await strapi.services.comment.create(data, { files });
        } else {
            ctx.request.body.user = ctx.state.user.id;
            entity = await strapi.services.comment.create(ctx.request.body);
        }
        return sanitizeEntity(entity, { model: strapi.models.comment });
    },

    async update(ctx) {
        const { id } = ctx.params;

        let entity;

        const [comment] = await strapi.services.comment.find({
            id: ctx.params.id,
            'user.id': ctx.state.user.id,
        });

        if (ctx.request.body.likes !== undefined ) {
            const wantsToggleLike = ctx.state.user.id;
            console.log(`Logged in user: ${wantsToggleLike}`);

            // const toggleData = ctx.request.body.likes[0];
            const toggleData = ctx.request.body.likes.replace('[','').replace(']', '');

            console.log(`Like Toggle user: ${toggleData}`);

            const commentRef = await strapi.services.comment.find({
                id: ctx.params.id,
            })

            if (wantsToggleLike.toString() !== toggleData.toString()) {
                return ctx.unauthorized(`You can't update this entry [like protection]`);
            }

            const allLikes = commentRef[0].likes;

            let like = true;

            for (let i = 0; i < allLikes.length; i++) {
                if (allLikes[i].id === wantsToggleLike) {
                    allLikes.splice(i, 1);
                    like = false;
                    break;
                }
            }

            const updatedLikes = [];

            allLikes.forEach(e => {
                updatedLikes.push(e.id);
            });

            if (like) {
                updatedLikes.push(wantsToggleLike);
            }

            console.log(`updated likes \n${updatedLikes}`);
            ctx.request.body.likes = updatedLikes;

        }

        let likeEvent = Object.keys(ctx.request.body);


        if (!comment && !likeEvent.length===1 && !likeEvent.includes('liked_by')) {
            return ctx.unauthorized(`You can't update this entry [edit protection]`);
        }

        if (ctx.is('multipart')) {
            const { data, files } = parseMultipartData(ctx);
            entity = await strapi.services.comment.update({ id }, data, {
                files,
            });
        } else {
            entity = await strapi.services.comment.update({ id }, ctx.request.body);
        }

        return sanitizeEntity(entity, { model: strapi.models.comment });
    },


};
