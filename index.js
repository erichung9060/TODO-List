import { escapeHtml } from './escape.js';
import template from './template.html';

export default {
  async fetch(request, env) {
    const defaultData = { todos: [] };


    const setCache = (key, data) => env.EXAMPLE_TODOS.put(key, data);
    const getCache = key => env.EXAMPLE_TODOS.get(key);


    async function getTodos(request) {
      const cacheKey = "todo";
      let data;
      const cache = await getCache(cacheKey);
      if (!cache) {
        await setCache(cacheKey, JSON.stringify(defaultData));
        data = defaultData;
      } else {
        data = JSON.parse(cache);
      }


      const body = template.replace(
        '$TODOS',
        JSON.stringify(
          data.todos?.map(todo => ({
            name: escapeHtml(todo.name),
            completed: !!todo.completed
          })) ?? []
        )
      );
      return new Response(body, {
        headers: { 'Content-Type': 'text/html' }
      });
    }


    async function updateTodos(request) {
      const body = await request.text();
      const cacheKey = "todo";
      try {
        JSON.parse(body);
        await setCache(cacheKey, body);
        return new Response(body, { status: 200 });
      } catch (err) {
        return new Response(err, { status: 500 });
      }
    }


    if (request.method === 'PUT') {
      return updateTodos(request);
    }
    return getTodos(request);
  }
};
