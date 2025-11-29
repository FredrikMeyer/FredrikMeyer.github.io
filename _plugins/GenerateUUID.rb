require 'securerandom'

module Jekyll
  class RenderUUID < Liquid::Tag
    @@generated = SecureRandom.uuid

    def initialize(tag_name, text, tokens)
      super
      @text = text
    end

    def render(context)
      "#{@text}#{@@generated}"
    end
  end
end

Liquid::Template.register_tag('uuid', Jekyll::RenderUUID)
