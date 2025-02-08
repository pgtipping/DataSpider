class BaseStrategy:
    def __init__(self, *args, **kwargs):
        pass

    def execute(self, *args, **kwargs):
        raise NotImplementedError('Subclasses must implement the execute method.')
