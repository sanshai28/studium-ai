import 'package:flutter_test/flutter_test.dart';
import 'package:studium_tablet/models/source.dart';

void main() {
  group('Source', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 'src-1',
        'fileName': 'document.pdf',
        'fileType': 'application/pdf',
        'fileSize': 1048576,
        'uploadedAt': '2025-01-15T10:00:00.000Z',
      };

      final source = Source.fromJson(json);

      expect(source.id, 'src-1');
      expect(source.fileName, 'document.pdf');
      expect(source.fileType, 'application/pdf');
      expect(source.fileSize, 1048576);
    });

    group('formattedSize', () {
      test('formats bytes', () {
        final source = _makeSource(fileSize: 500);
        expect(source.formattedSize, '500 B');
      });

      test('formats kilobytes', () {
        final source = _makeSource(fileSize: 2048);
        expect(source.formattedSize, '2.0 KB');
      });

      test('formats megabytes', () {
        final source = _makeSource(fileSize: 1048576);
        expect(source.formattedSize, '1.0 MB');
      });
    });

    group('fileIcon', () {
      test('returns PDF icon for .pdf', () {
        expect(_makeSource(fileName: 'test.pdf').fileIcon, '📄');
      });

      test('returns doc icon for .docx', () {
        expect(_makeSource(fileName: 'test.docx').fileIcon, '📝');
      });

      test('returns image icon for .png', () {
        expect(_makeSource(fileName: 'test.png').fileIcon, '🖼️');
      });

      test('returns text icon for .txt', () {
        expect(_makeSource(fileName: 'test.txt').fileIcon, '📃');
      });

      test('returns clip icon for unknown extension', () {
        expect(_makeSource(fileName: 'test.xyz').fileIcon, '📎');
      });
    });
  });
}

Source _makeSource({String fileName = 'test.pdf', int fileSize = 1024}) {
  return Source(
    id: 'src-1',
    fileName: fileName,
    fileType: 'application/octet-stream',
    fileSize: fileSize,
    uploadedAt: DateTime(2025, 1, 1),
  );
}
