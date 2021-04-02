[<img src="https://cdn.anychart.com/images/logo-transparent-segoe.png?2" width="234px" alt="AnyChart - Robust JavaScript/HTML5 Chart library for any project">](https://www.anychart.com)

## AnyStock Big Data Speed Test

Our JavaScript charts support rendering thousands of data points in milliseconds. Run a speedtest or try real-time live data streaming.

[<img src="https://static.anychart.com/images/github/big-data-speed-test.png" alt="Big Data Speed Test | AnyChart">](https://www.anychart.com/solutions/big-data-speed-test/)

## Modifying source code

There are two possible options of modifying demo source code, [using Node.js and npm](#using-nodejs-and-npm)
and [with no additional requirements](#with-no-additional-requirements).

Please, ensure you have all [requirements](#installing-requirements) installed before running.

### Download the project

```bash
git clone git@github.com:anychart-solutions/big-data-speed-test.git
cd big-data-speed-test
```

### Install the project dependencies

```bash
yarn
```

### Run the project for development (with hot-reload)

```bash
yarn dev
```

Now, when all environment is up and running, you may use following instructions to modify source code:

- To modify demo stylesheets, edit `src/sass/*.scss` files.
- To modify demo JavaScript, edit `src/js/*.js` file.
- To modify demo markup, edit `src/index.html` file.

### With no additional requirements

This option doesn't require Node.js and npm installation.
Also it imposes some limitations on demo source code modification process.

- To run the demo, please, open index.html page.
- To modify demo stylesheets, please add your own `<styles>` section to `src/index.html` file.
- Unfortunately, here is no way to modify demo JavaScript code except adding your own `<script>` section to `src/index.html` file.
- To modify demo markup, edit `src/index.html` file.
- To make a production build you need to copy all required files to distribution folder by your own.

## Running on production

All production files are located in [distribution](https://github.com/anychart-solutions/big-data-speed-test/tree/master/dist) folder.
In case you did some modification of the source code, you need to rebuild production files as mentioned in [Using Node.js and npm](#using-node.js-and-npm) section or manually using following command.

```
yarn build
```

## Installing requirements

To run demo development environment, please, ensure you have installed [Git](https://git-scm.com/), [Node.js](https://nodejs.org/), [npm](https://www.npmjs.com/) and [gulp](http://gulpjs.com/), overwise:

- To install Node.js and npm, visit [installation instructions](https://docs.npmjs.com/getting-started/installing-node) page.
- To install yarn globally using `npm install yarn -g` command.
- To install git, visit [installation instructions](https://git-scm.com/book/en/v1/Getting-Started-Installing-Git) page.

## Links

- [AnyStock Speedtest Demo at AnyChart.Com](https://www.anychart.com/solutions/big-data-speed-test/)
- [Documentation](https://docs.anychart.com)
- [JavaScript API Reference](https://api.anychart.com)
- [Code Playground](https://playground.anychart.com)

## License

AnyChart Big Data Speed Test solution includes two parts:

- Code of the solution that allows to use Javascript library (in this case, AnyChart) to create a demo. You can use, edit, modify it, use it with other Javascript libraries without any restrictions. It is released under [Apache 2.0 License](https://github.com/anychart-solutions/big-data-speed-test/blob/master/LICENSE).
- AnyChart JavaScript library. It is released under Commercial license. You can test this plugin with the trial version of AnyChart. Our trial version is not limited by time and doesn't contain any feature limitations. Check details [here](https://www.anychart.com/buy/).

If you have any questions regarding licensing - please contact us. <sales@anychart.com>

[![Analytics](https://ga-beacon.appspot.com/UA-228820-4/Solutions/big-data-speed-test?pixel&useReferer)](https://github.com/igrigorik/ga-beacon)
