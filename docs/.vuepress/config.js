module.exports = {
    title: 'Splash Documentation',
    description: 'Documentation for the Splash server',
    themeConfig: {
        sidebar: [
            {
                title: 'Reference',   // required
                path: '',      // optional, link of the title, which should be an absolute path and must exist
                collapsable: false, // optional, defaults to true
                sidebarDepth: 1,    // optional, defaults to 1
                children: [
                    '/Compounds',
                    '/Edit_Page'
                ]
            },
            {
                title: 'Tutorials',   // required
                path: '',      // optional, link of the title, which should be an absolute path and must exist
                collapsable: false, // optional, defaults to true
                sidebarDepth: 1,    // optional, defaults to 1
                children: [
                    '/tutorials/Login',
                    '/tutorials/Create_Compound',
                    '/tutorials/Edit_Compound',
                    '/tutorials/Insert_Citation',
                    '/tutorials/Additional_References'
                ]
            },
        ]
    },
}