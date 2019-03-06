import { State, User } from "./types";
import { MutationsMaker } from "../precast/context";
import mutationsDefiner from './mutations';
import * as keyExtractors from './keyExtractor';
import * as cgi from './cgi';

export enum Errors {
    isLoading,
    userRequired,
}

export const actions = (getState: () => State, makeMutation: MutationsMaker<State>) => {
    const mutations = makeMutation(mutationsDefiner);

    const uniqLock = async (key: string) => {
        const { loadStack } = getState();
        if (loadStack.includes(key)) {
            throw Errors.isLoading;
        }
        mutations.addLoadKey(key);
        return () => mutations.removeLoadKey(key);
    };

    return {
        async login(user: User) {
            mutations.setUser(user);
            mutations.upsertUsers([user]);
        },
        async logout() {
            const unlock = await uniqLock(keyExtractors.KEYOF_LOGOUT());

            await cgi.logout();
            mutations.setUser(null);

            unlock();
        },
        async fetchList(tagname: string, page: number) {
            const unlock = await uniqLock(keyExtractors.KEYOF_FETCH_LIST(tagname, page));

            const { tags } = getState();
            const showTag = tagname && !tags.find(t => t.name === tagname);

            const [res, err] = await cgi.fetchList(tagname, page, showTag);
            if (err) {
                throw err;
            }
            if (showTag) {
                mutations.upsertTag(res.tag);
            }
            mutations.upsertList(res.blogs, tagname, page, res.count);
            mutations.upsertBlogs(res.blogs);

            unlock();
        },
        async fetchComments(blogid: string) {
            const unlock = await uniqLock(keyExtractors.KEYOF_FETCH_COMMENTS(blogid));

            const [res, err] = await cgi.fetchComments(blogid);
            if (err) {
                throw err;
            }
            if (res.ok) {
                mutations.upsertUsers(res.users);
                mutations.upsertComments(blogid, res.comments);
            }

            unlock();
        },
        async fetchBlog(blogid: string) {
            const unlock = await uniqLock(keyExtractors.KEYOF_FETCH_BLOG(blogid));

            const [blog, err] = await cgi.fetchBlog(blogid);
            if (err) {
                throw err;
            }
            mutations.upsertBlogs([blog]);

            unlock();
        },
        async postComment(blogid: string, content: string, quote: string) {
            const { user } = getState();
            if (!user) {
                throw Errors.userRequired;
            }

            const unlock = await uniqLock(keyExtractors.KEYOF_POST_COMMENT(blogid));

            const [comment, err] = await cgi.postComment(blogid, content, quote);
            if (err) {
                throw err;
            }
            mutations.addComment(blogid, comment);

            unlock();
        },
    };
};

export default actions;