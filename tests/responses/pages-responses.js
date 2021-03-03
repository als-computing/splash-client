export default {
  xss_attack: {
    data: {
      title: 'Boron',
      page_type: 'dangerous',
      metadata: [
        {
          title: 'contributors',
          text: 'Matt Landsman, Lauren Nalley',
        },
      ],
      documentation: 'DANGEROUS MARKDOWN<script>alert(\'hahahahahah\')</script>',
    },
    uid: 'test_uid',

    splash_md: {
      creator: '969b56eb-7ca2-464b-83ad-5d879aa3aa0f',
      create_date: '2021-02-04T08:11:41',
      last_edit: '2021-02-04T08:11:41',
      edit_record: [],
      version: 1,
    },
  },

  boron: {
    data: {
      splash_md: {
        creator: 'creator_uid',
        create_date: 'Creation Date',
        last_edit: 'Last Time Edited',
        edit_record: [],
        version: 2,
      },
      title: 'Title of Document',
      page_type: 'Type of Page',
      uid: 'test_uid',
      metadata: [
        {
          title: 'Title of Field',
          text: 'Value of Field',
        },
      ],
      documentation: 'Markdown goes here',
    },
  },

  boron2: {
    data: {
      splash_md: {
        creator: 'creator_uid2',
        create_date: 'CreationTime2',
        last_edit: 'LastEditTime2',
        edit_record: [{ user: 'test_uid3', time: 'test_time3' }],
        version: 2,
      },
      title: 'Document 2 Title',
      page_type: 'Type2 of page',
      uid: 'test_uid2',
      metadata: [{ title: 'test', text: 'test' }],
      documentation: 'Test Markdown',
    },
  },
};
