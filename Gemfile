source "https://rubygems.org"

# github-pages → jekyll-commonmark → commonmarker 0.x requires Ruby < 4.
# Pin so `bundle install` fails fast with a clear message on Ruby 4.x.
ruby ">= 3.2.0", "< 4.0"

gem "wdm", ">= 0.2.0" if Gem.win_platform?

# Stay aligned with GitHub Pages' supported Jekyll stack.
gem "github-pages", group: :jekyll_plugins
gem "liquid", "~> 4.0.4"

# Required for local `jekyll serve` on Ruby 3+.
gem "webrick", "~> 1.9"
