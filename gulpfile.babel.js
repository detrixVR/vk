/**
 * Created by bogdanov on 25.08.2015.
 *
 * https://github.com/gulpjs/gulp/blob/master/docs/recipes/split-tasks-across-multiple-files.md
 */

import requireDir from 'require-dir';

requireDir('./gulp/tasks', { recurse: true });