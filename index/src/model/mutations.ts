import { State, Tag, Comment, Blog, User } from "./types";
import { upsertItem, generateAbstract } from "../precast/pure";

export default {
    upsertTag: (tag: Tag) => ({ tags }: State) => ({
        tags: upsertItem(tags, t => t.name === tag.name, () => tag),
    }),
    upsertList: (blogs: Blog[], query: string, page: number, count: number) => ({ lists }: State) => {
        const nextLists = upsertItem(lists, l => l.query === query, old => {
            const syncAt = +new Date();
            const blogIds = blogs.map(b => b.id);
            if (old) {
                const storedBlogs = [...old.blogs];
                storedBlogs[page] = blogIds;

                return {
                    query,
                    blogs: storedBlogs,
                    syncAt,
                    count,
                }
            } else {
                return {
                    query,
                    blogs: [blogIds],
                    syncAt,
                    count,
                }
            }
        });
        return {
            lists: nextLists,
        };
    },
    upsertBlogs: (blogs: Blog[]) => ({ blogs: PrevBlogs }: State) => {
        const syncAt = +new Date();
        return {
            blogs: [
                ...PrevBlogs.filter(item => blogs.findIndex(b => b.id === item.id) === -1),
                ...blogs.map(b => ({
                    ...b,
                    abstract: generateAbstract(b),
                    syncAt,
                }))]
        }
    },
    upsertComments: (blogid: string, comments: Comment[]) => ({ comments: PrevComments }: State) => ({
        comments: new Map(PrevComments).set(blogid, comments),
    }),
    addComment: (blogid: string, comment: Comment) => ({ comments }: State) => {
        const nextCommentsOfThisBlog = [...comments.get(blogid), comment];
        return {
            comments: new Map(comments).set(blogid, nextCommentsOfThisBlog),
        };
    },
    upsertUsers: (users: User[]) => ({ users: prevUsers }: State) => ({
        users: [
            ...prevUsers.filter(currentUser => users.find(u => u.id === currentUser.id) === null),
            ...users,
        ],
    }),
    setUser: (user: User) => () => ({ user }),
    addLoadKey: (key: string) => ({ loadStack }: State) => ({
        loadStack: [...loadStack, key],
    }),
    removeLoadKey: (key: string) => ({ loadStack }: State) => ({
        loadStack: loadStack.filter(k => k !== key),
    }),
}