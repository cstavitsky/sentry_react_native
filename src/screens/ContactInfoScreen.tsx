import * as React from 'react';
import {
  Image,
  Button,
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  TextInput
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import * as Sentry from '@sentry/react-native';
import Toast from 'react-native-toast-message';
import {AppDispatch, RootState} from '../reduxApp';
import {GradientBtn} from './CartScreen';
import {BACKEND_URL} from '../config';

/** TODO
 * An example of how to add a Sentry Transaction to a React component manually.
 * So you can control all spans that belong to that one transaction.
 * EmpowerPlant is a  Higher-order component, becuase it's a Function Component,
 * and both Function Components and Class Components are Higher-order components.
 * Higher-order component can only read the props coming in. Props are changed as they're passed in.
 * Redux not in use here, so redux is not passing props, therefore Profile can't view that.
 * Could do redux w/ hooks, but the Profiler isn't going to work with that yet.
 */
const ContactInfoScreen = (props) => {
  const dispatch = useDispatch();
  const [toolData, setToolData] = React.useState<
    | {
        sku: string;
        name: string;
        // description:string
        image: string;
        // img: string;
        id: number;
        type: string;
        price: number;
        // appDispatch: AppDispatch; // EVAL not needed
      }[]
    | null
  >(null);

  const cartData = useSelector((state: RootState) => state.cart1);
  console.log("**** cartData", cartData)

//   const loadData = () => {};

// TODO need props.navigation?
//   React.useLayoutEffect(() => {
//     navigation.setOptions({
//       headerRightContainerStyle: {paddingRight: 20},
//       headerRight: () => {
//         return (
//           <Button
//             onPress={() => {
//               navigation.navigate('Cart');
//             }}
//             title="Cart"
//           />
//         );
//       },
//     });
//   }, [navigation]);

//   React.useEffect(() => {
//     loadData(); // this line is not blocking
//   }, []); 
    const [text, onChangeText] = React.useState("Useless Text");
    const items = [
        {id:1, placeholder:'email'},
        {id:2, placeholder:'first name'},
        {id:3, placeholder:'last name'},
        {id:4, placeholder:'address'},
        {id:5, placeholder:'city'},
        {id:6, placeholder:'country/region'},
        {id:7, placeholder:'state'},
        {id:8, placeholder:'zip code'},
    ]
    return (
        <View style={styles.screen}>
        <Text
            style={{
                marginTop: 20,
                marginBottom: 20,
                fontSize: 18,
                fontWeight: '600',
            }}>Contact Info</Text>
        <View>
            <FlatList
                data={items}
                appDispatch={dispatch}
                renderItem={({item}) => {
                    return (
                        <SafeAreaView>
                        <TextInput
                            style={styles.input}
                            value={""}
                            placeholder={item.placeholder}
                            // keyboardType="numeric"
                            onPressIn={() => {
                                dispatch({ type: 'FILL_FIELDS', payload: 'dummydata' })}
                            }
                        />
                        </SafeAreaView>
                    );
                }}
                keyExtractor={(item) => item.id}
            />
        <View style={styles.flavorContainer}>
            {/* <Image
            source={require('../assets/sentry-logo.png')}
            style={styles.logo}
            /> */}
            <Text style={{marginLeft: 5, fontWeight: '500'}}>
            Deliver to Sentry - San Francisco 94105
            </Text>
        </View>
        <View style={styles.orderBtnContainer}>
            <GradientBtn
            buttonText={styles.buttonText}
            // colors={['#FFE0B2', '#FFB74D']}
            colors={['#002626']}
            style={styles.linearGradient}
            onPress={() => performCheckoutOnServer()}
            //   progressState={orderStatusUI}
            progressState={false}
            name={'Place your order'}></GradientBtn>
        </View>
        </View>
        </View>
    );
};

const performCheckoutOnServer = async () => {
    // Contact Information, Keep Me Updated
    // log it right before sending

    // 1. connected to UseState or whatever
    // 2. log it

    // ----------- Sentry Start Transaction ------------------------
    let transaction = Sentry.startTransaction({name: 'checkout'});
    Sentry.configureScope((scope) => scope.setSpan(transaction));
    // -------------------------------------------------------------

    // TODO
    // Update in this method
    let data = await placeOrder(Toast);

    // ----------- Sentry Finish Transaction -----------------------
    const span = transaction.startChild({
        data,
        op: 'task',
        description: `processing shopping cart result`,
    });

    span.finish();
    transaction.finish();
};

const placeOrder = async (
    uiToast: null | UIToast = null,
  ): Promise<Response> => {
    // setOrderStatusUI(true);

    // TODO
    const data = {cart: Object.values(cartData)};

    let response = await fetch( 
      `${BACKEND_URL}/checkout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          email: 'test@sentry.io',
        },
        body: JSON.stringify(data),
      },
    ).catch((err) => {
      throw new Error(err);
    });
    // setOrderStatusUI(false);
    if (response.status !== 200) {
      uiToast
        ? uiToast.show({
            type: 'error',
            position: 'bottom',
            text1: 'Error: Could not place order.',
          })
        : null;

      Sentry.captureException(
        new Error(
          response.status +
            ' - ' +
            (response.statusText || ' INTERNAL SERVER ERROR'),
        ),
      );
    } else {
      uiToast
        ? uiToast.show({
            type: 'success',
            position: 'bottom',
            text1: 'Request Succeeded',
          })
        : null;
    }
    return response;
  };
/* This works because sentry/react-native wraps sentry/react right now.
* The Sentry Profiler can use any higher-order component but you need redux if you want the `react.update`, 
* because that comes from props being passed into the Profiler (which comes from redux).
* The Profiler doesn't watch the internal state of EmpowerPlant here, and that's why `useState` won't be picked up by sentry sdk, unless you use the Profiler.
* Don't use the Sentry Profiler here yet, because the profiler span was finishing so quick that the transaction would finish prematurely,
* and this was causing Status:Cancelled on that span, and warning "cancelled span due to idleTransaction finishing"
*/
export default ContactInfoScreen

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 5,
    backgroundColor: '#ffffff',
  },
  input: {
    height: 40,
    margin: 10,
    borderWidth: 1,
    padding: 10,

    // new
    borderRadius: 2,
    borderColor: '#002626',
  },
  linearGradient: {
    height: 50,

    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#8D6E63',
    flexDirection: 'column',
    justifyContent: 'center',

    width:300,
    margin:10, // ?
  },
  orderBtnContainer: {
    height: 50,

    paddingLeft: 20,
    paddingRight: 20,
    // borderRadius: 2,
    borderWidth: 1,
    borderColor: 'white',
    flexDirection: 'column',
    justifyContent: 'center',

    width:300,
    margin:10, // ?
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    color:'white'
  },
  flavorContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});
