module.exports = {
    
    title: 'Splash Documentation',
    description: 'Documentation for the Splash server',
    base: '/' + process.env.VUE_APP_SPLASH_BASE + '/docs/',
    themeConfig: {
        sidebar: [
            {
                title: 'Reference',   // required
                path: '',      // optional, link of the title, which should be an absolute path and must exist
                collapsable: false, // optional, defaults to true
                sidebarDepth: 1,    // optional, defaults to 1
                children: [
                    '/List_Pages',
                    '/Edit_Page',
                    '/Versioned_View',
                    '/Compounds',
                ]
            },
            {
                title: 'Tutorials',   // required
                path: '',      // optional, link of the title, which should be an absolute path and must exist
                collapsable: false, // optional, defaults to true
                sidebarDepth: 1,    // optional, defaults to 1
                children: [
                    '/tutorials/Login',
                    '/tutorials/Create_Page',
                    '/tutorials/Edit_Page',
                    '/tutorials/Insert_Citation',
                    '/tutorials/Additional_References',
                    '/tutorials/View_Versions'
                ]
            },
        ]
    },
plugins: [
    {
        extendPageData($page) {
            // 1. Add extra fields.
            if (process.env.VUE_APP_SPLASH_BASE === undefined || process.env.VUE_APP_SPLASH_BASE === null){
                throw Error('process.env.VUE_APP_SPLASH_BASE must be defined and non-null')
            }
            $page.VUE_APP_SPLASH_BASE = '/' + process.env.VUE_APP_SPLASH_BASE + '/'
        },
    }
]
}