import constructorReducer, {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor
} from './constructorSlice';
import { TConstructorIngredient } from '../../utils/types';

describe('constructorSlice reducer', () => {
  const initialState = {
    bun: null,
    ingredients: []
  };

  const mockBun: TConstructorIngredient = {
    _id: 'bun-1',
    id: 'bun-1-unique',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://code.s3.yandex.net/react/code/bun-02.png',
    image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png'
  };

  const mockMainIngredient: TConstructorIngredient = {
    _id: 'main-1',
    id: 'main-1-unique',
    name: 'Биокотлета из марсианской Магнолии',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 424,
    image: 'https://code.s3.yandex.net/react/code/meat-01.png',
    image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png'
  };

  const mockSauce: TConstructorIngredient = {
    _id: 'sauce-1',
    id: 'sauce-1-unique',
    name: 'Соус Spicy-X',
    type: 'sauce',
    proteins: 30,
    fat: 20,
    carbohydrates: 40,
    calories: 30,
    price: 90,
    image: 'https://code.s3.yandex.net/react/code/sauce-02.png',
    image_large: 'https://code.s3.yandex.net/react/code/sauce-02-large.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/sauce-02-mobile.png'
  };

  describe('addIngredient', () => {
    it('should add bun to state', () => {
      const state = constructorReducer(initialState, addIngredient(mockBun));

      expect(state.bun).toBeDefined();
      expect(state.bun?.type).toBe('bun');
      expect(state.bun?.name).toBe('Краторная булка N-200i');
      expect(state.bun?.id).toBeDefined();
    });

    it('should replace existing bun when new bun is added', () => {
      const stateWithBun = {
        bun: mockBun,
        ingredients: []
      };

      const newBun: TConstructorIngredient = {
        ...mockBun,
        _id: 'bun-2',
        name: 'Флюоресцентная булка R2-D3'
      };

      const state = constructorReducer(stateWithBun, addIngredient(newBun));

      expect(state.bun?.name).toBe('Флюоресцентная булка R2-D3');
      expect(state.bun?._id).toBe('bun-2');
    });

    it('should add main ingredient to ingredients array', () => {
      const state = constructorReducer(
        initialState,
        addIngredient(mockMainIngredient)
      );

      expect(state.ingredients).toHaveLength(1);
      expect(state.ingredients[0].type).toBe('main');
      expect(state.ingredients[0].name).toBe('Биокотлета из марсианской Магнолии');
      expect(state.ingredients[0].id).toBeDefined();
    });

    it('should add sauce to ingredients array', () => {
      const state = constructorReducer(initialState, addIngredient(mockSauce));

      expect(state.ingredients).toHaveLength(1);
      expect(state.ingredients[0].type).toBe('sauce');
      expect(state.ingredients[0].name).toBe('Соус Spicy-X');
    });

    it('should add multiple ingredients', () => {
      let state = constructorReducer(
        initialState,
        addIngredient(mockMainIngredient)
      );
      state = constructorReducer(state, addIngredient(mockSauce));

      expect(state.ingredients).toHaveLength(2);
      expect(state.ingredients[0].type).toBe('main');
      expect(state.ingredients[1].type).toBe('sauce');
    });

    it('should generate unique id for each added ingredient', () => {
      let state = constructorReducer(
        initialState,
        addIngredient(mockMainIngredient)
      );
      state = constructorReducer(state, addIngredient(mockMainIngredient));

      expect(state.ingredients).toHaveLength(2);
      expect(state.ingredients[0].id).not.toBe(state.ingredients[1].id);
    });
  });

  describe('removeIngredient', () => {
    it('should remove ingredient by id', () => {
      const stateWithIngredients = {
        bun: null,
        ingredients: [
          { ...mockMainIngredient, id: 'id-1' },
          { ...mockSauce, id: 'id-2' }
        ]
      };

      const state = constructorReducer(
        stateWithIngredients,
        removeIngredient('id-1')
      );

      expect(state.ingredients).toHaveLength(1);
      expect(state.ingredients[0].id).toBe('id-2');
    });

    it('should not change state if ingredient id is not found', () => {
      const stateWithIngredients = {
        bun: null,
        ingredients: [{ ...mockMainIngredient, id: 'id-1' }]
      };

      const state = constructorReducer(
        stateWithIngredients,
        removeIngredient('non-existent-id')
      );

      expect(state.ingredients).toHaveLength(1);
      expect(state.ingredients[0].id).toBe('id-1');
    });

    it('should handle removing from empty ingredients array', () => {
      const state = constructorReducer(
        initialState,
        removeIngredient('some-id')
      );

      expect(state.ingredients).toHaveLength(0);
    });
  });

  describe('moveIngredient', () => {
    it('should move ingredient from one position to another', () => {
      const ingredient1 = { ...mockMainIngredient, id: 'id-1', name: 'Ingredient 1' };
      const ingredient2 = { ...mockSauce, id: 'id-2', name: 'Ingredient 2' };
      const ingredient3 = { ...mockMainIngredient, id: 'id-3', name: 'Ingredient 3' };

      const stateWithIngredients = {
        bun: null,
        ingredients: [ingredient1, ingredient2, ingredient3]
      };

      const state = constructorReducer(
        stateWithIngredients,
        moveIngredient({ fromIndex: 0, toIndex: 2 })
      );

      expect(state.ingredients[0].name).toBe('Ingredient 2');
      expect(state.ingredients[1].name).toBe('Ingredient 3');
      expect(state.ingredients[2].name).toBe('Ingredient 1');
    });

    it('should move ingredient forward in the array', () => {
      const ingredient1 = { ...mockMainIngredient, id: 'id-1', name: 'Ingredient 1' };
      const ingredient2 = { ...mockSauce, id: 'id-2', name: 'Ingredient 2' };
      const ingredient3 = { ...mockMainIngredient, id: 'id-3', name: 'Ingredient 3' };

      const stateWithIngredients = {
        bun: null,
        ingredients: [ingredient1, ingredient2, ingredient3]
      };

      const state = constructorReducer(
        stateWithIngredients,
        moveIngredient({ fromIndex: 2, toIndex: 0 })
      );

      expect(state.ingredients[0].name).toBe('Ingredient 3');
      expect(state.ingredients[1].name).toBe('Ingredient 1');
      expect(state.ingredients[2].name).toBe('Ingredient 2');
    });

    it('should handle moving to the same position', () => {
      const stateWithIngredients = {
        bun: null,
        ingredients: [
          { ...mockMainIngredient, id: 'id-1' },
          { ...mockSauce, id: 'id-2' }
        ]
      };

      const state = constructorReducer(
        stateWithIngredients,
        moveIngredient({ fromIndex: 0, toIndex: 0 })
      );

      expect(state.ingredients[0].id).toBe('id-1');
      expect(state.ingredients[1].id).toBe('id-2');
    });
  });

  describe('clearConstructor', () => {
    it('should clear all ingredients and bun', () => {
      const stateWithData = {
        bun: mockBun,
        ingredients: [mockMainIngredient, mockSauce]
      };

      const state = constructorReducer(stateWithData, clearConstructor());

      expect(state.bun).toBeNull();
      expect(state.ingredients).toHaveLength(0);
    });

    it('should work on already empty state', () => {
      const state = constructorReducer(initialState, clearConstructor());

      expect(state.bun).toBeNull();
      expect(state.ingredients).toHaveLength(0);
    });
  });

  describe('initial state', () => {
    it('should return initial state when called with undefined', () => {
      const state = constructorReducer(undefined, { type: 'unknown' });

      expect(state).toEqual({
        bun: null,
        ingredients: []
      });
    });
  });
});
