var DEFAULT = '7xsjmh.com2.z0.glb.clouddn.com';
var display = new Vue({
    el: '#tool-downloads',
    data: {
        releases_ct: [
            {version: '2.33.33.1', site: DEFAULT, date: 'Jan 22, 2017'},
            {version: '2.33.32.33', site: DEFAULT, date: 'Sep 10, 2016'},
            {version: '2.33.32.32', site: DEFAULT, date: 'Aug 13, 2016'},
            {version: '2.33.32.31', site: DEFAULT, date: 'Jun 24, 2016'},
            {version: '2.33.32.3', site: DEFAULT, date: 'May 17, 2016'},
            {version: '2.33.32.2', site: DEFAULT, date: 'May 05, 2016'},
            {version: '2.33.32.1', site: DEFAULT, date: 'Apr 02, 2016'},
            {version: '2.33.31.3', site: DEFAULT, date: 'Mar 15, 2016'},
            {version: '2.33.31.2', site: DEFAULT, date: 'Mar 09, 2016'},
            {version: '2.33.31.1', site: DEFAULT, date: 'Feb 29, 2016'},
            {version: '2.33.3.3',  site: DEFAULT, date: 'Feb 16, 2016'},
            {version: '2.33.3.2',  site: DEFAULT, date: 'Feb 14, 2016'},
            {version: '2.33.3.1',  site: DEFAULT, date: 'Dec 20, 2015'},
            {version: '2.33.2.3',  site: DEFAULT, date: 'Dec 05, 2015'},
            {version: '2.33.2.2',  site: DEFAULT, date: 'Nov 18, 2015'}, /*
            {version: '2.33.2.1',  site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.33.1.3',  site: DEFAULT, date: 'Jan 01, 1970'}, */
            {version: '2.33.1.2',  site: DEFAULT, date: 'Oct 09, 2015'}, /*
            {version: '2.33.1.1',  site: DEFAULT, date: 'Jan 01, 1970'}, */
            {version: '2.3.333.2', site: DEFAULT, date: 'Sep 14, 2015'},
            {version: '2.3.333.1', site: DEFAULT, date: 'Sep 13, 2015'}, /*
            {version: '2.3.332.3', site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.332.2', site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.332.1', site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.331.1', site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.33.3',  site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.33.2',  site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.33.1',  site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.32.1',  site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.31.1',  site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.3.333', site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.3.332', site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.3.331', site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.3.33',  site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.3.32',  site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.3.31',  site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.3.3',   site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.3.2',   site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.3.1',   site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.3.0',   site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.2.3',   site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.2.2',   site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.2.1',   site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.2.0',   site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.1.0',   site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.3.0.0',   site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.2.0.0',   site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.1.0.0',   site: DEFAULT, date: 'Jan 01, 1970'},
            {version: '2.0.0.0',   site: DEFAULT, date: 'Jan 01, 1970'}  */
        ],
        releases_ati: [
            {version: '1.0.4.2', site: DEFAULT, date: 'Jan 23, 2017'},
            {version: '1.0.4.1', site: DEFAULT, date: 'Oct 27, 2016'},
            {version: '1.0.4.0', site: DEFAULT, date: 'Oct 26, 2016'},
            {version: '1.0.3.5', site: DEFAULT, date: 'Sep 07, 2016'},
            {version: '1.0.3.4', site: DEFAULT, date: 'Aug 11, 2016'},
            {version: '1.0.3.3', site: DEFAULT, date: 'Jun 24, 2016'},
            {version: '1.0.3.2', site: DEFAULT, date: 'Jun 10, 2016'},
            {version: '1.0.3.1', site: DEFAULT, date: 'May 08, 2016'},
            {version: '1.0.2.4', site: DEFAULT, date: 'Apr 02, 2016'},
            {version: '1.0.2.3', site: DEFAULT, date: 'Mar 17, 2016'},
            {version: '1.0.2.2', site: DEFAULT, date: 'Feb 18, 2016'},
            {version: '1.0.2.1', site: DEFAULT, date: 'Feb 08, 2016'},
            {version: '1.0.2.0', site: DEFAULT, date: 'Feb 03, 2016'},
            {version: '1.0.1.2', site: DEFAULT, date: 'Jan 07, 2016'},
            {version: '1.0.1.1', site: DEFAULT, date: 'Jan 01, 2016'},
            {version: '1.0.1.0', site: DEFAULT, date: 'Dec 29, 2015'}
        ],
        releases_rp: [
            {version: '1.0.3.3', site: DEFAULT, date: 'Sep 25, 2016'},
            {version: '1.0.3.2', site: DEFAULT, date: 'Apr 02, 2016'},
            {version: '1.0.3.1', site: DEFAULT, date: 'Feb 29, 2016'},
            {version: '1.0.3.0', site: DEFAULT, date: 'Jan 15, 2016'},
            {version: '1.0.2.1', site: DEFAULT, date: 'Jan 01, 2016'},
            {version: '1.0.2.0', site: DEFAULT, date: 'Jan 01, 2016'},
            {version: '1.0.1.1', site: DEFAULT, date: 'Nov 18, 2015'},
            {version: '1.0.1.0', site: DEFAULT, date: 'Nov 11, 2015'},
            {version: '1.0.0.4', site: DEFAULT, date: 'Oct 19, 2015'}
        ]
    }
});
