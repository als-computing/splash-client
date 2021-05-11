export default {
  xss_attack: {
    data: {
      title: 'Boron',
      page_type: 'dangerous',
      documentation: 'DANGEROUS MARKDOWN<script>alert(\'hahahahahah\')</script>',
      references: [],
      uid: 'test_uid',

      splash_md: {
        creator: '969b56eb-7ca2-464b-83ad-5d879aa3aa0f',
        etag: 'aaaaaa-aaaa-aaaaa-aaaa-aaaaaaaa',
        create_date: '2021-02-04T08:11:41',
        last_edit: '2021-02-04T08:11:41',
        edit_record: [],
        version: 1,
      },
    },
  },

  boron: {
    data: {
      splash_md: {
        etag: 'bbbbb-bbbb-bbbbb-bbbbb-bbbbbbb',
        creator: 'creator_uid',
        create_date: 'Creation Date',
        last_edit: 'Last Time Edited',
        edit_record: [],
        version: 2,
      },
      title: 'Title of Document',
      page_type: 'Type of Page',
      uid: 'test_uid',
      documentation: 'Markdown goes here',
      references: [{ doi: '10.XX/XXXX', in_text: false }],
    },
  },

  boron2: {
    data: {
      splash_md: {
        etag: 'ccccc-ddddd-ffff-eeeee',
        creator: 'creator_uid2',
        create_date: 'CreationTime2',
        last_edit: 'LastEditTime2',
        edit_record: [{ user: 'test_uid3', time: 'test_time3' }],
        version: 2,
      },
      title: 'Document 2 Title',
      page_type: 'Type2 of page',
      uid: 'test_uid2',
      documentation: 'Test Markdown',
      references: [{ doi: '10.XX/XXXX', in_text: false }],
    },
  },
};
