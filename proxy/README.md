### How It Works

The command line tool (i.e the client) is the first actor in the communication pipeline - the `tunnel -p TARGET_LOCAL_PORT_NUMBER_HERE' command initiates a socket connection between the proxy server and itself. A key will be generated upon establishing this connection which can be sent to any user to enter on the proxy server's home page (i.e the base endpoint of the deployed server), which will contain a form for the key input.

If the local port the client is connected to has, say, a React app running on it, this will be piped to the user agent via the proxy.

### A Few Things to Note

- This connection isn't channeled through a secure layer at the moment as it is, in its current state, for learning purposes and hyperlocalized use cases

- I'll keep working on abstracting it when I have the time so that it evolves into an implementation that doesn't require impermanent domains and a lot of config overhead but there's really no timeline around that. Like I said, this started off primarily as a tool for fun, learning, and personal needs

### References

Architecture + idea inspired by:

- [ngrok] (https://github.com/inconshreveable/ngrok)
- [web-tunnel] (https://github.com/web-tunnel)
